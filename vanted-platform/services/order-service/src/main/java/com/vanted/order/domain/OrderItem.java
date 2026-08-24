package com.vanted.order.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne(optional = false) @JoinColumn(name = "order_id") private Order order;
    @Column(name = "service_id", nullable = false) private UUID serviceId;
    @Column(name = "service_name", nullable = false, length = 160) private String serviceName;
    @Column(nullable = false) private int quantity;
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2) private BigDecimal unitPrice;

    protected OrderItem() {}
    public OrderItem(UUID serviceId, String serviceName, int quantity, BigDecimal unitPrice) {
        this.serviceId=serviceId; this.serviceName=serviceName; this.quantity=quantity; this.unitPrice=unitPrice;
    }
    void setOrder(Order order){this.order=order;}
    public UUID getId(){return id;} public UUID getServiceId(){return serviceId;} public String getServiceName(){return serviceName;}
    public int getQuantity(){return quantity;} public BigDecimal getUnitPrice(){return unitPrice;}
}
