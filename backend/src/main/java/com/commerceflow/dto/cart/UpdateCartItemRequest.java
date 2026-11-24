package com.commerceflow.dto.cart;

import jakarta.validation.constraints.Positive;

public record UpdateCartItemRequest(
        @Positive(message = "Quantity must be at least 1")
        int quantity
) {
}
