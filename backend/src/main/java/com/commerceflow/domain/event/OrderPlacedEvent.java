package com.commerceflow.domain.event;

import java.math.BigDecimal;
import java.time.Instant;

public record OrderPlacedEvent(
        String orderNumber,
        Long orderId,
        String customerEmail,
        BigDecimal amount,
        Instant occurredAt
) {
    public static OrderPlacedEvent of(String orderNumber, Long orderId, String customerEmail, BigDecimal amount) {
        return new OrderPlacedEvent(orderNumber, orderId, customerEmail, amount, Instant.now());
    }
}
