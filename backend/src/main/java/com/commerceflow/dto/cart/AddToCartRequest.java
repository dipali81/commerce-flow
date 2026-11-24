package com.commerceflow.dto.cart;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record AddToCartRequest(
        @NotNull(message = "Product id is required")
        Long productId,

        @Positive(message = "Quantity must be at least 1")
        int quantity
) {
}
