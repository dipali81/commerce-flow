package com.commerceflow.mapper;

import com.commerceflow.domain.product.Product;
import com.commerceflow.dto.product.ProductResponse;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class ProductMapper {

    public static ProductResponse toResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getDescription(),
                product.getCategory(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getImageUrl(),
                product.isActive(),
                product.isActive() && product.getStockQuantity() > 0,
                product.getCreatedAt()
        );
    }
}
