#!/bin/sh

# انتظر قليلاً للتأكد من استقرار الشبكة (اختياري)
sleep 5

echo "Creating storage symlink..."
php artisan storage:link --force

echo "Running Migrations..."
php artisan migrate --force

echo "Fixing deduction_type enum (bonus/reward)..."
php artisan db:query "ALTER TABLE payroll_deductions MODIFY COLUMN deduction_type ENUM('absence','lateness','penalty','tax','insurance','other','bonus','reward') NOT NULL" 2>/dev/null || true

echo "Adding start_date/end_date to employee_requests if not exists..."
php artisan db:query "ALTER TABLE employee_requests ADD COLUMN IF NOT EXISTS start_date DATE NULL, ADD COLUMN IF NOT EXISTS end_date DATE NULL" 2>/dev/null || true

echo "Caching config and routes..."
php artisan config:cache
php artisan route:cache

echo "Starting Nginx and PHP-FPM..."
nginx
php-fpm
