import os
import shutil
import zipfile
import sys

def create_eb_backend_zip():
    # Force UTF-8 stdout if needed
    if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except AttributeError:
            pass

    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Locate ecommerce-backend and project root
    if os.path.basename(script_dir) == "ecommerce-backend":
        backend_dir = script_dir
        root_dir = os.path.dirname(script_dir)
    elif os.path.exists(os.path.join(script_dir, "ecommerce-backend")):
        backend_dir = os.path.join(script_dir, "ecommerce-backend")
        root_dir = script_dir
    else:
        backend_dir = script_dir
        root_dir = script_dir

    output_zip = os.path.join(backend_dir, "backend-deploy.zip")
    root_output_zip = os.path.join(root_dir, "backend-deploy.zip")
    
    excluded_dirs = {
        'node_modules',
        'scratch',
        '.git',
        '.vscode',
        '.idea',
        'venv',
        '__pycache__'
    }

    excluded_files = {
        'backend-deploy.zip',
        'backend.deploy',
        'backend-v5-update.zip',
        'zip_backend.py',
        'alter_test.js',
        'check_orders.js',
        'db_check.js',
        'get_categories.js',
        'test-insert.js',
        'test_status_update.js'
    }

    print(f"Packaging AWS Elastic Beanstalk bundle from: {backend_dir}")
    print(f"Output target: {output_zip}\n")

    count = 0
    with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(backend_dir):
            dirs[:] = [d for d in dirs if d not in excluded_dirs]
            
            for file in files:
                if file in excluded_files or file.endswith('.zip') or file.endswith('.log'):
                    continue
                
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, backend_dir)
                
                zipf.write(file_path, arcname)
                count += 1
                print(f"  + Added: {arcname}")

    # Synchronize to root zip location as well if different
    if root_output_zip != output_zip:
        shutil.copy2(output_zip, root_output_zip)

    zip_size_mb = os.path.getsize(output_zip) / (1024 * 1024)
    print(f"\nSuccessfully created Elastic Beanstalk deployment zip!")
    print(f"Total files zipped: {count}")
    print(f"Zip archive size: {zip_size_mb:.2f} MB")
    print(f"Locations updated:")
    print(f"  - {output_zip}")
    if root_output_zip != output_zip:
        print(f"  - {root_output_zip}")

if __name__ == "__main__":
    create_eb_backend_zip()
