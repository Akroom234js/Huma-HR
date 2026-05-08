#!/bin/sh

# انتظر قليلاً للتأكد من استقرار الشبكة (اختياري)
sleep 5

echo "Running Migrations..."
php artisan migrate --force

# تشغيل الـ Seeder فقط إذا لم يكن هناك مستخدم HR موجود مسبقاً
# هذا يمنع تعارض البيانات عند كل إعادة deploy
USER_COUNT=$(php artisan tinker --execute="echo \App\Models\User::count();" 2>/dev/null | tail -1)
if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    echo "First deploy detected — Running Seeders..."
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
