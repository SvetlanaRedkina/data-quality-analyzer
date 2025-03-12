from fastapi import FastAPI, UploadFile, File
import pandas as pd
import io
import re
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

# Create an object to handle requests
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Detect potential date columns with a two-layer approach
# Returns a dictionary of column names and whether they should be converted
def detect_date_columns(df, confidence_threshold=0.7):

    date_columns = {}

    for column in df.columns:
        # Skip not string/object columns
        if not (pd.api.types.is_string_dtype(df[column]) or pd.api.types.is_object_dtype(df[column])):
            continue
        # Skip columns with too many nulls
        if df[column].isna().mean() > 0.5:
            continue

        confidence = 0.0
        column_lower = column.lower()

        # Layer 1: quick checks
        # Check column names (date keywords)
        date_keywords = ['created', 'modified', 'updated', 'date', 'day', 'month', 'year', 'time']
        for date_keyword in date_keywords:
            if date_keyword in column_lower:
                confidence += 0.3

        # Check a small sample for date patterns
        sample = df[column].dropna().astype(str).head(10)

        if len(sample) > 0:
            pattern_matches = 0
            for s in sample:
                # Regex for common date format
                # Match pattern dates like '2023-12-31', '12/25/2023', '1.1.2023', '25 Dec 2023', '1 January 2023', and '2023 Jan 25'
                if re.search(r'\d{1,4}[-/\.]\d{1,2}[-/\.]\d{1,4}', s) or \
                   re.search(r'\d{1,2}\s[A-Za-z]{3,9}\s\d{2,4}', s) or \
                   re.search(r'\d{2,4}\s[A-Za-z]{3,9}\s\d{1,2}', s):
                    pattern_matches += 1

            pattern_score = pattern_matches / len(sample) * 0.5
            confidence += pattern_score

        # Layer 2: conversion test
        # Convert a large sample: min() returns the smallest of the arguments (50 if there are more than 50 values, the second argument if there are less than 50 values)
        sample_size = min(50, len(df[column].dropna()))
        test_sample = df[column].dropna().head(sample_size)

        try:
            # For values that cannot be converted to dates, it converts them to Not a Time
            # Silence warnings by specifying a format for common date patterns, fallback to dateutil if needed
            formats = ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y/%m/%d']
            best_format = None
            for fmt in formats:
                try:
                    # Try each format and see if it works
                    sample_test = pd.to_datetime(test_sample.head(5), format=fmt, errors='raise')
                    best_format = fmt
                    break
                except:
                    continue
            
            if best_format:
                converted = pd.to_datetime(test_sample, format=best_format, errors='coerce')
            else:
                converted = pd.to_datetime(test_sample, errors='coerce')
                
            # notna() assigns F for NaT, T for successfully converted datetime values
            success_rate = converted.notna().mean()

            confidence += success_rate * 0.4
        except:
            confidence -= 0.2

        date_columns[column] = {
            "confidence": round(confidence, 2),
            "should_convert": confidence >= confidence_threshold
        }

    return date_columns

# Decorator that tells read_root() handles GET requests to the URL path
@app.get("/")
def read_root():
    # Message-dictionary that FastAPI converts to JSON
    return{"message": "Hi"}

@app.post("/upload-csv/")
async def upload_csv(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))

    # Detect potential date columns
    date_detection = detect_date_columns(df)

    # Convert columns with high confidence
    converted_columns = []
    for column, info in date_detection.items():
        if info["should_convert"]:
            try:
                df[column] = pd.to_datetime(df[column], errors="coerce")
                converted_columns.append(column)
            except Exception:
                pass

    basic_info = {
        "filename": file.filename,
        "rows": len(df),
        "columns": len(df.columns),
        "column_names": df.columns.to_list()
    }

    # Column analysis
    column_analysis = {}
    for column in df.columns:
        col_data = df[column]
        analysis = {
            "data_type": str(col_data.dtype),
            "null_count": int(col_data.isna().sum()),
            "null_percentage": float(col_data.isna().mean() * 100),
            "unique_values": int(col_data.nunique()),
        }

        # Add statistics for numeric columns
        if pd.api.types.is_numeric_dtype(col_data):
            # Drop NULLs/NaN
            non_null = col_data.dropna()

            if len(non_null) > 0:
                # Add more stats for numeric columns
                analysis.update({
                    "min": float(non_null.min()),
                    "max": float(non_null.max()),
                    "mean": float(non_null.mean()),
                    "median": float(non_null.median()),
                    "std": float(non_null.std()),
                    "zeroes_count": int((non_null == 0).sum()),
                    "negative_count": int((non_null < 0).sum()),
                })

        elif pd.api.types.is_string_dtype(col_data) or pd.api.types.is_object_dtype(col_data):
            non_null = col_data.dropna().astype(str)
            if len(non_null) > 0:
                # Store the string length for every non-null cell in the column
                lengths = non_null.str.len()

                # Convert numpy.bool values to Python native booleans
                analysis.update({
                    "min_length": int(lengths.min()),
                    "max_length": int(lengths.max()),
                    "avg_length": float(lengths.mean()),
                    "empty_strings": int((non_null == "").sum()),
                    # Count strings that contain only digits
                    "numeric_strings": int(non_null.str.match(r'^\d+$').sum()),
                    # Count strings that contain only letters
                    "alphabetic_strings": int(non_null.str.match(r'^[a-zA-Z]+$').sum()),
                    # Count strings that contain only letters and digits
                    "alphanumeric_strings": int(non_null.str.match(r'^[a-zA-Z0-9]+$').sum()),
                    # Count strings that contain at least one special character
                    "with_special_characters": int(non_null.str.contains(r'[^a-zA-Z0-9\s]').sum()),
                    # One or more whitespace characters at the beginning
                    "leading_whitespace": int(non_null.str.match(r'^\s+').sum()),
                    # One or more whitespace characters at the end
                    "trailing_whitespace": int(non_null.str.match(r'\s+$').sum()),
                })

                # Sample frequent values (top 5)
                value_counts = non_null.value_counts().head(5).to_dict()
                # Convert to native Python types
                analysis["top_values"] = {str(k): int(v) for k, v in value_counts.items()}

        elif pd.api.types.is_datetime64_dtype(col_data):
            non_null = col_data.dropna()
            if len(non_null) > 0:
                # Ensure all values are native Python types
                year_distribution = {str(k): int(v) for k, v in non_null.dt.year.value_counts().to_dict().items()}
                day_of_week_distribution = {str(k): int(v) for k, v in non_null.dt.dayofweek.value_counts().to_dict().items()}
                
                analysis.update({
                    "min_date": str(non_null.min()),
                    "max_date": str(non_null.max()),
                    "date_range_days": int((non_null.max() - non_null.min()).days),
                    "year_distribution": year_distribution,
                    "day_of_week_distribution": day_of_week_distribution,
                })

        # Store in column_analysis dict
        column_analysis[column] = analysis

    # Convert all remaining numpy types to Python native types
    data_quality = {
        "total_missing_values": int(df.isna().sum().sum()),
        "missing_percentage": float(df.isna().sum().sum() / (len(df) * len(df.columns)) * 100),
        "duplicate_rows": int(df.duplicated().sum()),
    }

    # Ensure date_detection is JSON serializable
    serializable_date_detection = {}
    for column, info in date_detection.items():
        serializable_info = {}
        for key, value in info.items():
            # Convert any NumPy types to Python native types
            if hasattr(value, 'dtype') and hasattr(value, 'item'):
                serializable_info[key] = value.item()
            elif isinstance(value, bool) or (hasattr(value, 'dtype') and str(value.dtype).startswith('bool')):
                serializable_info[key] = bool(value)
            else:
                serializable_info[key] = value
        serializable_date_detection[column] = serializable_info

    # Build response
    response = {
        "file_info": basic_info,
        "column_analysis": column_analysis,
        "data_quality": data_quality,
        "date_detection": {
            "detected_columns": serializable_date_detection,
            "converted_columns": converted_columns
        }
    }

    return response