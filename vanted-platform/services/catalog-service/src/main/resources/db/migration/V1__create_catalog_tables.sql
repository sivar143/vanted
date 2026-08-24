CREATE TABLE services (
    id BINARY(16) NOT NULL,
    name VARCHAR(160) NOT NULL,
    description VARCHAR(2000) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    category VARCHAR(80) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    KEY ix_services_category_active (category, active),
    KEY ix_services_name (name)
);

INSERT INTO services (id, name, description, price, category, active, created_at, updated_at)
VALUES
(UUID_TO_BIN(UUID()), 'Premium Airport Concierge', 'Meet-and-assist service for airport arrivals and departures.', 2500.00, 'Airport', TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(UUID_TO_BIN(UUID()), 'Executive Ground Transfer', 'Pre-booked chauffeur-driven transfer with professional service.', 1800.00, 'Transport', TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6)),
(UUID_TO_BIN(UUID()), 'Luxury Travel Planning', 'End-to-end itinerary planning for premium leisure travel.', 5000.00, 'Travel', TRUE, CURRENT_TIMESTAMP(6), CURRENT_TIMESTAMP(6));
