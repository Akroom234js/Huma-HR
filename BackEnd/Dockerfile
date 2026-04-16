FROM php:8.2-fpm-alpine

# تثبيت الإضافات الضرورية
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

WORKDIR /var/www/html

# نسخ ملفات المشروع
COPY . .

# تثبيت المكتبات
RUN composer install --no-dev --optimize-autoloader

# إعداد Nginx (تأكد من وجود ملف default.conf في مساره)
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

# إعطاء صلاحيات التنفيذ لملف الـ entrypoint
RUN chmod +x entrypoint.sh

# الصلاحيات لمجلدات Laravel
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80

# استخدام ملف الـ entrypoint للتشغيل
ENTRYPOINT ["./entrypoint.sh"]
