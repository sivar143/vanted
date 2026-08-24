CREATE TABLE orders (
    id BINARY(16) NOT NULL,
    user_id BINARY(16) NOT NULL,
    status VARCHAR(30) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    idempotency_key VARCHAR(100) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_orders_idempotency (idempotency_key),
    KEY ix_orders_user_created (user_id, created_at)
);

CREATE TABLE order_items (
    id BINARY(16) NOT NULL,
    order_id BINARY(16) NOT NULL,
    service_id BINARY(16) NOT NULL,
    service_name VARCHAR(160) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    PRIMARY KEY (id),
    KEY ix_order_items_order (order_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id)
);
