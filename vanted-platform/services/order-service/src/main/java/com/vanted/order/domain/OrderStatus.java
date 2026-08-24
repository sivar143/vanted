package com.vanted.order.domain;

public enum OrderStatus {
    PENDING_PAYMENT,
    PAID,
    CONFIRMED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED,
    REFUNDED
}
