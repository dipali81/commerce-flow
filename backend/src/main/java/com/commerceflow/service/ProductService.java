package com.commerceflow.service;

import com.commerceflow.common.PagedResponse;
import com.commerceflow.dto.product.ProductRequest;
import com.commerceflow.dto.product.ProductResponse;

import java.math.BigDecimal;

public interface ProductService {

    PagedResponse<ProductResponse> search(String term, String category, BigDecimal minPrice,
                                          BigDecimal maxPrice, int page, int size,
                                          String sortBy, String sortDir);

    ProductResponse getById(Long id);

    ProductResponse create(ProductRequest request);

    ProductResponse update(Long id, ProductRequest request);

    void delete(Long id);
}
