#!/bin/bash
# Скрипт установки и настройки сервера чата на 92.255.77.211

echo "=== Настройка сервера чата 92.255.77.211 ==="

# Обновление системы
echo "Обновление пакетов..."
apt-get update
apt-get upgrade -y

# Установка необходимых пакетов
echo "Установка Apache, PHP, MySQL..."
apt-get install -y apache2 mysql-server php php-cli php-mysql php-json php-mbstring php-curl php-zip php-xml php-gd php-intl php-bcmath

# Установка Composer
echo "Установка Composer..."
curl -sS https://getcomposer.org/installer | php
mv composer.phar /usr/local/bin/composer

# Настройка MySQL
echo "Настройка MySQL..."
mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'RootPassword123!';"
mysql -e "FLUSH PRIVILEGES;"

# Создание базы данных и пользователя
echo "Создание базы данных..."
mysql -u root -pRootPassword123! <<EOF
CREATE DATABASE IF NOT EXISTS chat_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'chat_user'@'localhost' IDENTIFIED BY 'SecurePass123!';
GRANT ALL PRIVILEGES ON chat_app.* TO 'chat_user'@'localhost';
FLUSH PRIVILEGES;

USE chat_app;

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    status ENUM('online', 'offline', 'away') DEFAULT 'offline',
    last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fcm_token TEXT,
    public_key TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_status (status)
);

-- Таблица сообщений
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT,
    group_id INT,
    message_type ENUM('text', 'image', 'video', 'file', 'voice') DEFAULT 'text',
    message TEXT NOT NULL,
    encrypted_message TEXT,
    file_url VARCHAR(255),
    file_size INT,
    encryption_key_encrypted TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('sent', 'delivered', 'read') DEFAULT 'sent',
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id),
    INDEX idx_conversation (sender_id, receiver_id),
    INDEX idx_group (group_id),
    INDEX idx_timestamp (timestamp)
);

-- Таблица групп
CREATE TABLE IF NOT EXISTS groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    avatar_url VARCHAR(255),
    admin_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(id)
);

-- Таблица участников групп
CREATE TABLE IF NOT EXISTS group_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE KEY unique_member (group_id, user_id)
);

-- Таблица файлов
CREATE TABLE IF NOT EXISTS files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Таблица логов
CREATE TABLE IF NOT EXISTS server_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    log_type VARCHAR(50),
    message TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_log_type (log_type),
    INDEX idx_created_at (created_at)
);

-- Тестовые пользователи
INSERT INTO users (username, email, password) VALUES 
('alice', 'alice@example.com', '\$2y\$10\$YourHashedPasswordHere'),
('bob', 'bob@example.com', '\$2y\$10\$YourHashedPasswordHere'),
('charlie', 'charlie@example.com', '\$2y\$10\$YourHashedPasswordHere')
ON DUPLICATE KEY UPDATE email=VALUES(email);

EOF

# Создание структуры папок
echo "Создание структуры папок..."
mkdir -p /var/www/html/chat_app
mkdir -p /var/www/html/chat_app/uploads
mkdir -p /var/www/html/chat_app/classes
mkdir -p /var/www/html/chat_app/logs

# Настройка прав доступа
echo "Настройка прав доступа..."
chown -R www-data:www-data /var/www/html/chat_app
chmod -R 755 /var/www/html/chat_app
chmod 777 /var/www/html/chat_app/uploads

# Настройка Apache
echo "Настройка Apache..."
cat > /etc/apache2/sites-available/chat_app.conf <<EOF
<VirtualHost *:80>
    ServerName 92.255.77.211
    ServerAdmin admin@92.255.77.211
    DocumentRoot /var/www/html/chat_app
    
    <Directory /var/www/html/chat_app>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog \${APACHE_LOG_DIR}/chat_app_error.log
    CustomLog \${APACHE_LOG_DIR}/chat_app_access.log combined
</VirtualHost>
EOF

# Включение сайта и модулей
a2ensite chat_app.conf
a2enmod rewrite headers deflate
systemctl restart apache2

# Настройка фаервола
echo "Настройка фаервола..."
ufw allow 80/tcp
ufw allow 22/tcp
ufw allow 8080/tcp  # Для WebSocket
ufw --force enable

# Установка WebSocket сервера (Ratchet)
echo "Установка WebSocket сервера..."
cd /var/www/html/chat_app
composer require cboden/ratchet

# Создание сервиса для WebSocket
cat > /etc/systemd/system/websocket-chat.service <<EOF
[Unit]
Description=Chat WebSocket Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/html/chat_app
ExecStart=/usr/bin/php /var/www/html/chat_app/websocket_server.php
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Включение автозагрузки сервиса
systemctl daemon-reload
systemctl enable websocket-chat.service

# Создание cron задач
echo "Настройка cron задач..."
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/bin/php /var/www/html/chat_app/cron/cleanup.php") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/bin/php /var/www/html/chat_app/cron/check_online.php") | crontab -

echo "=== Установка завершена ==="
echo "Сервер доступен по адресу: http://92.255.77.211"
echo "WebSocket сервер: ws://92.255.77.211:8080"
echo ""
echo "Не забудьте:"
echo "1. Настроить SSL сертификат (Let's Encrypt)"
echo "2. Изменить пароли в config.php"
echo "3. Настроить FCM в Firebase Console"
echo "4. Запустить WebSocket сервер: systemctl start websocket-chat"