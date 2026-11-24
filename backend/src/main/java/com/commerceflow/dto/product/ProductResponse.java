package com.commerceflow.dto.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(
        Long id,
        String sku,
        String name,
        String description,
        String category,
        BigDecimal price,
        int stockQuantity,
        String imageUrl,
        boolean active,
        boolean inStock,
        LocalDateTime createdAt
) {
}
