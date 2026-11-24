package com.commerceflow.dto.order;

import com.commerceflow.domain.order.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        OrderStatus status,
        BigDecimal totalAmount,
        String shippingLine1,
        String shippingLine2,
        String city,
        String postalCode,
        String country,
        LocalDateTime placedAt,
        List<OrderItemResponse> items
) {
}
