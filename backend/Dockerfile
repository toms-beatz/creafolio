FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    postgresql-dev \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    oniguruma-dev

RUN docker-php-ext-install pdo pdo_pgsql gd xml mbstring pcntl

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock ./

RUN composer install --no-scripts --no-autoloader --no-dev

COPY . .

RUN composer dump-autoload --optimize --no-scripts

# Clear bootstrap cache copied from host (may contain dev-only providers like Pail)
RUN rm -f bootstrap/cache/packages.php bootstrap/cache/services.php

RUN APP_ENV=production BROADCAST_CONNECTION=log php artisan package:discover --ansi 2>/dev/null || true

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
