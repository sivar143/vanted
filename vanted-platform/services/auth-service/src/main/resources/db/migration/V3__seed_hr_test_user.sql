INSERT INTO users (id,email,password_hash,first_name,last_name,role,enabled,created_at,updated_at)
SELECT UUID_TO_BIN(UUID()),'hr@vanted.local','$2y$12$Mfjrrufc8BuymiYGV3uRk.ZASSfhvIeeMKF/7ox4zN2Ie3dO7YT.K','Vanted','Human Resources','HR',TRUE,CURRENT_TIMESTAMP(6),CURRENT_TIMESTAMP(6)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='hr@vanted.local');