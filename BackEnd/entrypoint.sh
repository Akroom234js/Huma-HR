#!/bin/sh

# انتظر قليلاً للتأكد من استقرار قاعدة البيانات
sleep 10

echo "Checking Database Connection..."
php artisan db:monitor || echo "Database connection failed! Check your ENV variables."

echo "Running Migrations..."
# تشغيل الـ migration مع طباعة المخرجات للتصحيح
php artisan migrate --force || { echo "Migrations failed!"; exit 1; }

echo "Checking migration status..."
php artisan migrate:status

# تشغيل الـ Seeder فقط إذا لم يكن هناك مستخدمين
USER_COUNT=$(php artisan tinker --execute="echo \App\Models\User::count();" 2>/dev/null | tail -1)
if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ] || echo "$USER_COUNT" | grep -q "SQLSTATE"; then
    echo "First deploy or empty DB detected — Running Seeders..."
    php artisan db:seed --force
else
    echo "Database already seeded (found $USER_COUNT users) — Skipping seeders."
fi

echo "Caching config and routes..."
php artisan config:cache
php artisan route:cache

echo "Starting Nginx and PHP-FPM..."
nginx
php-fpm
