import os
import zipfile

def main():
    exclude_list = [
        "node_modules", ".env", ".git", "alter_test.js", 
        "check_orders.js", "db_check.js", "test_status_update.js", 
        "backend-v5-update.zip", "test-insert.js", "scratch",
        "get_categories.js"
    ]
    backend_dir = r"C:\Ecommerce\ecommerce-backend"
    zip_path = r"C:\Ecommerce\backend-deploy.zip"

    if os.path.exists(zip_path):
        try:
            os.remove(zip_path)
        except Exception as e:
            print(f"Warning: could not remove existing zip: {e}")

    print(f"Zipping {backend_dir} to {zip_path} with Unix path separators...")
    
    count = 0
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(backend_dir):
            # Modify dirs in-place to prune walk
            dirs[:] = [d for d in dirs if d not in exclude_list]
            for file in files:
                if file in exclude_list:
                    continue
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, backend_dir)
                # Force Unix style forward-slashes for path separators in ZIP archive
                arcname = rel_path.replace(os.path.sep, '/')
                zipf.write(file_path, arcname)
                count += 1
                
    print(f"Successfully archived {count} files with Unix path separators to {zip_path}")

if __name__ == "__main__":
    main()
