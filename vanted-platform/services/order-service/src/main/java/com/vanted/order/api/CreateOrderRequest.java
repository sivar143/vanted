package com.vanted.order.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateOrderRequest(@NotEmpty List<@Valid Item> items) {
    public record Item(
        @NotNull UUID serviceId,
        @NotEmpty String serviceName,
        @Min(1) int quantity,
        @NotNull BigDecimal unitPrice
    ) {}
}
