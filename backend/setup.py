import os
from fire import Fire

# Directories to create
def create_project_structure():
    directories = [
        'app',
        'app/api',
        'app/core',
    ]

    files = [
        'app/main.py',
        'app/api/routes.py',
        'app/api/__init__.py',
        'app/core/analyzer.py',
        'app/core/__init__.py'
    ]

    # Create directories
    for dir_path in directories:
        # exist_ok=True won't error if the directory exists
        os.makedirs(dir_path, exist_ok=True)
        print(f"Created directory {dir_path}")

    # Create files
    for file_path in files:
        # Open/create file
        # 'a' for append more - if file doesn't exist creates new, if it does exist, it opens for appending
        # 'with' to close the file once done
        with open(file_path, 'a'):
            # 'pass' for no writing
            pass
        print(f"Created file: {file_path}")

if __name__ == "__main__":
    Fire(create_project_structure)
    