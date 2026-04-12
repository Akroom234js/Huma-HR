# استخدام نسخة PHP 8.2 المناسبة لـ Laravel
FROM php:8.2-fpm-alpine

# تثبيت الإضافات الضرورية لـ Laravel و MySQL
RUN apk add --no-cache \
    nginx \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    curl

RUN docker-php-ext-install pdo_mysql bcmath gd

# تثبيت Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# نسخ ملفات المشروع إلى الحاوية
WORKDIR /var/www/html
COPY . .

# تثبيت التبعيات (Dependencies)
RUN composer install --no-dev --optimize-autoloader

# إعدادات الصلاحيات لمجلدات Laravel
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# نسخ إعدادات Nginx التي أنشأناها في الخطوة الأولى
COPY docker/nginx/default.conf /etc/nginx/http.d/default.conf

# تشغيل التطبيق (PHP + Nginx)
EXPOSE 80
CMD php-fpm -D && nginx -g "daemon off;"
