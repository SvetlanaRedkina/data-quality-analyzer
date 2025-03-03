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

        # Store in column_analysis dict where column is a key and analysis are values
        column_analysis[column] = analysis

    # Build response
    response = {
        "file info:": basic_info,
        "column ana;ysis:": column_analysis
    }

    return response