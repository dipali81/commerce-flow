package com.commerceflow.mapper;

import com.commerceflow.domain.order.Order;
import com.commerceflow.domain.order.OrderItem;
import com.commerceflow.dto.order.OrderItemResponse;
import com.commerceflow.dto.order.OrderResponse;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class OrderMapper {

    public static OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(OrderMapper::toItemResponse)
                .toList();
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getShippingLine1(),
                order.getShippingLine2(),
                order.getCity(),
                order.getPostalCode(),
                order.getCountry(),
                order.getPlacedAt(),
                items
        );
    }

    private static OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProductSku(),
                item.getProductName(),
                item.getUnitPrice(),
                item.getQuantity(),
                item.getLineTotal()
        );
    }
}
