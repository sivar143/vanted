package com.vanted.order.api;

import com.vanted.order.domain.Order;
import com.vanted.order.domain.OrderItem;
import com.vanted.order.service.OrderService;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService service;
    public OrderController(OrderService service) { this.service = service; }

    @PostMapping
    public ResponseEntity<OrderResponse> create(@AuthenticationPrincipal Jwt jwt,
                                                 @RequestHeader("Idempotency-Key") String idempotencyKey,
                                                 @Valid @RequestBody CreateOrderRequest request) {
        Order order = service.create(UUID.fromString(jwt.getSubject()), idempotencyKey, request);
        return ResponseEntity.ok(OrderResponse.from(order));
    }

    @GetMapping
    public List<OrderResponse> mine(@AuthenticationPrincipal Jwt jwt) {
        return service.findByUser(UUID.fromString(jwt.getSubject())).stream().map(OrderResponse::from).toList();
    }

    public record OrderResponse(UUID id, String status, BigDecimal totalAmount, List<Item> items) {
        static OrderResponse from(Order order) {
            return new OrderResponse(order.getId(), order.getStatus().name(), order.getTotalAmount(),
                order.getItems().stream().map(i -> new Item(i.getServiceId(), i.getServiceName(), i.getQuantity(), i.getUnitPrice())).toList());
        }
        public record Item(UUID serviceId, String serviceName, int quantity, BigDecimal unitPrice) {}
    }
}
