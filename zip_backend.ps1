$tempDir = "C:\Ecommerce\temp_backend_deploy"
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir

# Copy backend files recursively including hidden files/folders
$excludeList = @("node_modules", ".env", ".git", "alter_test.js", "check_orders.js", "db_check.js", "test_status_update.js", "backend-v5-update.zip", "test-insert.js", "scratch")
Get-ChildItem -Path "C:\Ecommerce\ecommerce-backend" -Force | Where-Object { $_.Name -notin $excludeList } | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $tempDir -Recurse -Force
}

# Create new zip using tar.exe to ensure forward slash separators for Linux/Elastic Beanstalk compatibility
if (Test-Path "C:\Ecommerce\backend-deploy.zip") { Remove-Item -Force "C:\Ecommerce\backend-deploy.zip" }
tar -a -c -f "C:\Ecommerce\backend-deploy.zip" -C $tempDir .

# Clean up
Remove-Item -Recurse -Force $tempDir
Write-Output "✅ Backend deployment package backend-deploy.zip successfully created!"
