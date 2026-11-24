package com.commerceflow.service.impl;

import com.commerceflow.common.PagedResponse;
import com.commerceflow.domain.product.Product;
import com.commerceflow.dto.product.ProductRequest;
import com.commerceflow.dto.product.ProductResponse;
import com.commerceflow.exception.BadRequestException;
import com.commerceflow.exception.DuplicateResourceException;
import com.commerceflow.exception.ResourceNotFoundException;
import com.commerceflow.mapper.ProductMapper;
import com.commerceflow.repository.ProductRepository;
import com.commerceflow.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("price", "name", "sku", "createdAt", "stockQuantity");
    private static final int MAX_PAGE_SIZE = 100;

    private final ProductRepository productRepository;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ProductResponse> search(String term, String category, BigDecimal minPrice,
                                                  BigDecimal maxPrice, int page, int size,
                                                  String sortBy, String sortDir) {
        if (page < 0) {
            throw new BadRequestException("Page index cannot be negative");
        }
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException("Page size must be between 1 and " + MAX_PAGE_SIZE);
        }
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("Minimum price cannot be greater than maximum price");
        }

        String safeSortBy = ALLOWED_SORT_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page, size, Sort.by(direction, safeSortBy, "id"));

        Page<Product> result = productRepository.search(
                blankToNull(term), blankToNull(category), minPrice, maxPrice, pageable);
        return new PagedResponse<>(
                result.getContent().stream().map(ProductMapper::toResponse).toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return ProductMapper.toResponse(findProduct(id));
    }

    @Override
    @Transactional
    public ProductResponse create(ProductRequest request) {
        String sku = request.sku().trim().toUpperCase(Locale.ROOT);
        if (productRepository.findBySku(sku).isPresent()) {
            throw new DuplicateResourceException("Product with SKU '" + sku + "' already exists");
        }
        Product product = Product.builder()
                .sku(sku)
                .name(request.name().trim())
                .description(request.description())
                .category(request.category().trim())
                .price(request.price())
                .stockQuantity(request.stockQuantity())
                .imageUrl(request.imageUrl())
                .active(request.active() == null || request.active())
                .build();
        return ProductMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, ProductRequest request) {
        Product product = findProduct(id);
        String sku = request.sku().trim().toUpperCase(Locale.ROOT);
        productRepository.findBySku(sku)
                .filter(existing -> !existing.getId().equals(id))
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("Product with SKU '" + sku + "' already exists");
                });

        product.setSku(sku);
        product.setName(request.name().trim());
        product.setDescription(request.description());
        product.setCategory(request.category().trim());
        product.setPrice(request.price());
        product.setStockQuantity(request.stockQuantity());
        product.setImageUrl(request.imageUrl());
        if (request.active() != null) {
            product.setActive(request.active());
        }
        return ProductMapper.toResponse(productRepository.save(product));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Product product = findProduct(id);
        product.setActive(false);
        productRepository.save(product);
    }

    private Product findProduct(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
