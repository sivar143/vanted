CREATE DATABASE IF NOT EXISTS vanted_auth;
CREATE DATABASE IF NOT EXISTS vanted_catalog;
CREATE DATABASE IF NOT EXISTS vanted_order;
CREATE DATABASE IF NOT EXISTS vanted_payment;

GRANT ALL PRIVILEGES ON vanted_auth.* TO 'vanted'@'%';
GRANT ALL PRIVILEGES ON vanted_catalog.* TO 'vanted'@'%';
GRANT ALL PRIVILEGES ON vanted_order.* TO 'vanted'@'%';
GRANT ALL PRIVILEGES ON vanted_payment.* TO 'vanted'@'%';
FLUSH PRIVILEGES;
