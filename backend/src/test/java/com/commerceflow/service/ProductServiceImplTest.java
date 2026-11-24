package com.commerceflow.service;

import com.commerceflow.common.PagedResponse;
import com.commerceflow.domain.product.Product;
import com.commerceflow.dto.product.ProductResponse;
import com.commerceflow.exception.BadRequestException;
import com.commerceflow.exception.ResourceNotFoundException;
import com.commerceflow.repository.ProductRepository;
import com.commerceflow.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.nullable;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;
    @InjectMocks
    private ProductServiceImpl productService;

    @Test
    void searchRejectsInvalidPageSizeBeforeQueryingDatabase() {
        assertThatThrownBy(() -> productService.search(null, null, null, null, 0, 0, "name", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Page size");
        assertThatThrownBy(() -> productService.search(null, null, BigDecimal.TEN, BigDecimal.ONE,
                0, 10, "name", "asc"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Minimum price");
        verifyNoInteractions(productRepository);
    }

    @Test
    void searchUsesWhitelistedSortAndReturnsMappedPage() {
        Product product = Product.builder()
                .id(1L)
                .sku("SKU-1")
                .name("Sample product")
                .price(new BigDecimal("99.00"))
                .stockQuantity(3)
                .active(true)
                .build();
        when(productRepository.search(nullable(String.class), nullable(String.class), nullable(BigDecimal.class),
                nullable(BigDecimal.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(product)));

        PagedResponse<ProductResponse> response = productService.search(
                null, null, null, null, 0, 12, "price; drop table products", "asc");

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(productRepository).search(nullable(String.class), nullable(String.class), nullable(BigDecimal.class),
                nullable(BigDecimal.class), captor.capture());
        assertThat(captor.getValue().getSort().getOrderFor("createdAt")).isNotNull();
        assertThat(response.content()).hasSize(1);
        assertThat(response.content().get(0).sku()).isEqualTo("SKU-1");
        assertThat(response.content().get(0).inStock()).isTrue();
    }

    @Test
    void getByIdThrowsWhenProductDoesNotExist() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product");
    }
}
