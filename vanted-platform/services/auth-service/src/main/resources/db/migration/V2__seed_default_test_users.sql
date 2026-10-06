-- Development/test seed users.
-- Idempotent: existing accounts are never modified or have their passwords reset.
-- Default development password for all three accounts: 1234

INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    enabled,
    created_at,
    updated_at
)
SELECT
    UUID_TO_BIN(UUID()),
    'admin@vanted.local',
    '$2y$12$Mfjrrufc8BuymiYGV3uRk.ZASSfhvIeeMKF/7ox4zN2Ie3dO7YT.K',
    'Vanted',
    'Administrator',
    'ADMIN',
    TRUE,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'admin@vanted.local'
);

INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    enabled,
    created_at,
    updated_at
)
SELECT
    UUID_TO_BIN(UUID()),
    'provider@vanted.local',
    '$2y$12$Mfjrrufc8BuymiYGV3uRk.ZASSfhvIeeMKF/7ox4zN2Ie3dO7YT.K',
    'Vanted',
    'Provider',
    'PROVIDER',
    TRUE,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'provider@vanted.local'
);

INSERT INTO users (
    id,
    email,
    password_hash,
    first_name,
    last_name,
    role,
    enabled,
    created_at,
    updated_at
)
SELECT
    UUID_TO_BIN(UUID()),
    'customer@vanted.local',
    '$2y$12$Mfjrrufc8BuymiYGV3uRk.ZASSfhvIeeMKF/7ox4zN2Ie3dO7YT.K',
    'Vanted',
    'Customer',
    'CUSTOMER',
    TRUE,
    CURRENT_TIMESTAMP(6),
    CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'customer@vanted.local'
);
