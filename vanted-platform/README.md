# Vanted Platform

Production rebuild of Vanted using Angular, Java/Spring Boot, MySQL, Flyway, Docker and NGINX.

## Target architecture

- Frontend: Angular 22
- Backend: Java 21 + Spring Boot 4.1
- Database: MySQL 8.4 LTS
- Migrations: Flyway
- Reverse proxy: NGINX
- Authentication: Spring Security + JWT/refresh tokens
- API: REST/OpenAPI

The existing React application remains in the repository while the new platform is built under `vanted-platform/`.
