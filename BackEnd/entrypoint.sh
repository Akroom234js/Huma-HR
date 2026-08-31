#!/bin/sh

# انتظر قليلاً للتأكد من استقرار الشبكة (اختياري)
sleep 5

echo "Creating storage symlink..."
php artisan storage:link --force

echo "Running Migrations..."
php artisan migrate --force

echo "Fixing deduction_type enum (bonus/reward)..."
php artisan tinker --execute="DB::statement(\"ALTER TABLE payroll_deductions MODIFY COLUMN deduction_type ENUM('absence','lateness','penalty','tax','insurance','other','bonus','reward') NOT NULL\");" 2>/dev/null || true

echo "Caching config and routes..."
php artisan config:cache
php artisan route:cache

echo "Starting Queue Worker in background..."
php artisan queue:work --queue=ai-evaluation,default &

echo "Starting Nginx and PHP-FPM..."
nginx
php-fpm
