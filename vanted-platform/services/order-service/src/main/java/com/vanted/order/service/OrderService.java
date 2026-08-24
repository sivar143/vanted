package com.vanted.order.service;

import com.vanted.order.api.CreateOrderRequest;
import com.vanted.order.domain.Order;
import com.vanted.order.domain.OrderItem;
import com.vanted.order.repository.OrderRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {
    private final OrderRepository repository;

    public OrderService(OrderRepository repository) { this.repository = repository; }

    @Transactional
    public Order create(UUID userId, String idempotencyKey, CreateOrderRequest request) {
        if (idempotencyKey == null || idempotencyKey.isBlank() || idempotencyKey.length() > 100) {
            throw new IllegalArgumentException("A valid Idempotency-Key header is required");
        }
        var existing = repository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) return existing.get();

        BigDecimal total = request.items().stream()
            .map(i -> i.unitPrice().multiply(BigDecimal.valueOf(i.quantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (total.signum() < 0) throw new IllegalArgumentException("Order total cannot be negative");

        Order order = new Order(userId, total, idempotencyKey);
        request.items().forEach(i -> order.addItem(new OrderItem(i.serviceId(), i.serviceName(), i.quantity(), i.unitPrice())));
        return repository.save(order);
    }

    @Transactional(readOnly = true)
    public List<Order> findByUser(UUID userId) { return repository.findByUserIdOrderByCreatedAtDesc(userId); }
}
