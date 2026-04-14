#!/bin/sh

# انتظر قليلاً للتأكد من استقرار الشبكة (اختياري)
sleep 5

echo "Running Migrations..."
php artisan migrate --force

echo "Running Seeders..."
php artisan db:seed --force

echo "Caching config and routes..."
php artisan config:cache
php artisan route:cache

echo "Starting Nginx and PHP-FPM..."
nginx
php-fpm
