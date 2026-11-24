package com.commerceflow.mapper;

import com.commerceflow.domain.cart.Cart;
import com.commerceflow.domain.cart.CartItem;
import com.commerceflow.dto.cart.CartItemResponse;
import com.commerceflow.dto.cart.CartResponse;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class CartMapper {

    public static CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(CartMapper::toItemResponse)
                .toList();
        int totalItems = items.stream().mapToInt(CartItemResponse::quantity).sum();
        BigDecimal subtotal = items.stream()
                .map(CartItemResponse::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartResponse(cart.getId(), items, totalItems, subtotal);
    }

    private static CartItemResponse toItemResponse(CartItem item) {
        return new CartItemResponse(
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getSku(),
                item.getProduct().getName(),
                item.getProduct().getImageUrl(),
                item.getQuantity(),
                item.getProduct().getPrice(),
                item.lineTotal(),
                item.getProduct().isActive() && item.getProduct().getStockQuantity() > 0
        );
    }
}
