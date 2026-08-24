package com.vanted.order.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(name = "user_id", nullable = false) private UUID userId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private OrderStatus status = OrderStatus.PENDING_PAYMENT;
    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2) private BigDecimal totalAmount;
    @Column(name = "idempotency_key", nullable = false, unique = true, length = 100) private String idempotencyKey;
    @Column(name = "created_at", nullable = false) private Instant createdAt = Instant.now();
    @Column(name = "updated_at", nullable = false) private Instant updatedAt = Instant.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    protected Order() {}
    public Order(UUID userId, BigDecimal totalAmount, String idempotencyKey) { this.userId=userId; this.totalAmount=totalAmount; this.idempotencyKey=idempotencyKey; }
    public UUID getId(){return id;} public UUID getUserId(){return userId;} public OrderStatus getStatus(){return status;}
    public BigDecimal getTotalAmount(){return totalAmount;} public String getIdempotencyKey(){return idempotencyKey;} public List<OrderItem> getItems(){return items;}
    public void addItem(OrderItem item){items.add(item); item.setOrder(this);} 
}
