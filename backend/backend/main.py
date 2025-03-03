from fastapi import FastAPI, UploadFile, File
import pandas as pd
import io
import re
from datetime import datetime

# Create an object to handle requests
app = FastAPI()

# Decorator that tells read_root() handles GET requests to the URL path
@app.get("/")
def read_root():
    # Message-dictionary that FastAPI converts to JSON
    return{"message": "Hi"}

@app.post("/upload-csv/")
# Async allows to wait for the file upload
# 'file: UploadFile' tells what type of object is expected. 'File() handles file extraction from HTTP request, (...) makes it mandatory
async def upload_csv(file: UploadFile = File(...)):
    # 'file.read()' reads the binary content, await pauses execution until the file reading is complete
    contents = await file.read()
    # 'io.Bytes()' creates a file-like object from the bytes
    df = pd.read_csv(io.BytesIO(contents))

    # Sometimes datetimes can be interpreted as of type object
    # Convert potential datetime columns
    for column in df.columns:
        if pd.api.types.is_object_dtype(df[column]):
            try:
                df[column] = pd.to_datetime(df[column])
            except (ValueError, TypeError):
                pass

    basic_info = {
        "filename:": file.filename,
        "rows:": len(df),
        "columns:": len(df.columns),
        "column names:": df.columns.to_list()
    }

    # Column analysis
    column_analysis = {}
    for column in df.columns:
        col_data = df[column]
        analysis = {
            "data type:": str(col_data.dtype),
            "null count:": int(col_data.isna().sum()),
            "null percentage:": round(col_data.isna().mean() * 100, 2),
            "unique values:": int(col_data.nunique()),
        }

        # Add statistics for numeric columns
        if pd.api.types.is_numeric_dtype(col_data):
            # Drop NULLs/NaN
            non_null = col_data.dropna()

            if len(non_null) > 0:
                # Add more stats for numeric columns
                analysis.update({
                    "min:": float(non_null.mean()),
                    "max:": float(non_null.max()),
                    "mean:": float(non_null.mean()),
                    "median:": float(non_null.median()),
                    "std:": float(non_null.std()),
                    "zeroes count:": int((non_null == 0).sum()),
                    "negative count:": int((non_null < 0).sum()),
                })

        elif pd.api.types.is_string_dtype(col_data) or pd.api.types.is_object_dtype(col_data):
            non_null = col_data.dropna().astype(str)
            if len(non_null) > 0:
                # Store the string length for every non-null cell in the column
                lengths = non_null.str.len()

                analysis.update({
                    "min length:": int(lengths.min()),
                    "max length:": int(lengths.max()),
                    "avg lemgth:": int(round(lengths.mean(),2)),
                    "empty strings:": int((non_null == "").sum()),
                    # Count strings that contain only digits (e.g., "123", "456")
                    "numeric strings:": int(non_null.str.match(r'^\d+$').sum()),
                    # Count strings that contain only letters (e.g., "banana", "APPLE")
                    "alphabetic strings:": int(non_null.str.match(r'^[a-zA-Z]+$').sum()),
                    # Count strings that contain only letters and digits (e.g., "abc123", not "abc-123")
                    "alphanumeric strings:": int(non_null.str.match(r'^[a-zA-Z0-9]+$').sum()),
                    # Count strings that contain at least one special character (e.g., "hello!", "user@example.com")
                    "with special characters:": int(non_null.str.contains(r'[^a-zA-Z0-9\s]').sum()),
                    # One or more whitespace characters at the beginning
                    "leading whitespace:": int(non_null.str.match(r'^\s+').sum()),
                    # One or more whitespace characters at the end
                    "trailing whitespace:": int(non_null.str.match(r'\s+').sum()),
                })

                # Sample frequent values (top 5)
                value_counts = non_null.value_counts().head(5).to_dict()
                # value_counts.items() gets key-value pairs from the value_counts dict
                # for k,v loops through each key-value pair
                # analysis["top+values"] creates a new dict
                analysis["top_values"] = {str(k): int(v) for k,v in value_counts.items()}

        elif pd.api.types.is_datetime64_dtype(col_data):
            non_null = col_data.dropna()
            if len(non_null) > 0:
                analysis.update({
                    "min date:": str(non_null.min()),
                    "max date:": str(non_null.max()),
                    "date range days:": int((non_null.max() - non_null.min()).days),
                    "year distribution:": non_null.dt.year.value_counts().to_dict(),
                    "day of week distribution:": non_null.dt.dayofweek.value_counts().to_dict(),
                })

        # Store in column_analysis dict where column is a key and analysis are values
        column_analysis[column] = analysis

    data_quality = {
        # isna() - True for nulls, first .sum() gets nulls count per column, second .sum() adds column-wise nulls
        "total missing values:": int(df.isna().sum().sum()),
        # Percentage of nulls in the dataframe
        "missing percentage:": round(df.isna().sum().sum() / (len(df) * len(df.columns)) * 100, 2),
        # Sum duplicate rows
        "duplicate rows:": int(df.duplicated().sum()),
    }

    # Build response
    response = {
        "file info:": basic_info,
        "column ana;ysis:": column_analysis,
        "data quality:": data_quality
    }

    return response