package com.vanted.order.repository;

import com.vanted.order.domain.Order;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByIdempotencyKey(String idempotencyKey);
    java.util.List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
