# استخدام نسخة PHP مناسبة لـ Laravel
FROM php:8.2-fpm-alpine

# تحديد مسار العمل
WORKDIR /var/www/html

# تثبيت الإضافات اللازمة لـ PHP و MySQL و Nginx
RUN apk add --no-cache \
    nginx \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_mysql gd zip

# تثبيت Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# نسخ ملفات المشروع
COPY . .

# تثبيت مكتبات Laravel
RUN composer install --no-dev --optimize-autoloader

# إعداد Nginx
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

# إعطاء الصلاحيات لمجلدات التخزين والكاش
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80

# تشغيل السيرفر
CMD ["sh", "-c", "php artisan migrate --force && php artisan db:seed --force && php artisan config:cache && php artisan route:cache && nginx && php-fpm"]
