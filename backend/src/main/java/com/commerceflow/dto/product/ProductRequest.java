package com.commerceflow.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductRequest(
        @NotBlank(message = "SKU is required")
        @Pattern(regexp = "^[A-Za-z0-9_-]{3,60}$", message = "SKU may contain letters, numbers, '-' and '_' only")
        String sku,

        @NotBlank(message = "Product name is required")
        @Size(max = 160, message = "Product name must be at most 160 characters")
        String name,

        @Size(max = 1000, message = "Description must be at most 1000 characters")
        String description,

        @NotBlank(message = "Category is required")
        @Size(max = 80, message = "Category must be at most 80 characters")
        String category,

        @DecimalMin(value = "0.01", message = "Price must be greater than zero")
        BigDecimal price,

        @Min(value = 0, message = "Stock quantity cannot be negative")
        int stockQuantity,

        @Size(max = 500, message = "Image URL must be at most 500 characters")
        String imageUrl,

        Boolean active
) {
}
