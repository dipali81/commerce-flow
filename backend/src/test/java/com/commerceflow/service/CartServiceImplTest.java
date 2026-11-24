package com.commerceflow.service;

import com.commerceflow.domain.cart.Cart;
import com.commerceflow.domain.cart.CartItem;
import com.commerceflow.domain.product.Product;
import com.commerceflow.domain.user.Role;
import com.commerceflow.domain.user.User;
import com.commerceflow.dto.cart.AddToCartRequest;
import com.commerceflow.dto.cart.CartResponse;
import com.commerceflow.dto.cart.UpdateCartItemRequest;
import com.commerceflow.exception.InsufficientStockException;
import com.commerceflow.exception.ResourceNotFoundException;
import com.commerceflow.repository.CartRepository;
import com.commerceflow.repository.ProductRepository;
import com.commerceflow.repository.UserRepository;
import com.commerceflow.service.impl.CartServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceImplTest {

    @Mock
    private CartRepository cartRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @InjectMocks
    private CartServiceImpl cartService;

    private User user;
    private Product product;

    @BeforeEach
    void setUp() {
        user = User.builder().id(9L).email("user@example.com").role(Role.ROLE_USER).build();
        product = Product.builder()
                .id(1L)
                .sku("SKU-1")
                .name("Sample product")
                .price(new BigDecimal("100.00"))
                .stockQuantity(5)
                .active(true)
                .build();
    }

    @Test
    void addItemCreatesCartAndReturnsSubtotal() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartRepository.findByUserId(9L)).thenReturn(Optional.empty());
        when(userRepository.getReferenceById(9L)).thenReturn(user);
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CartResponse response = cartService.addItem(9L, new AddToCartRequest(1L, 2));

        assertThat(response.totalItems()).isEqualTo(2);
        assertThat(response.subtotal()).isEqualByComparingTo("200.00");
        assertThat(response.items()).hasSize(1);
    }

    @Test
    void addItemRejectsQuantityAboveStock() {
        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        when(cartRepository.findByUserId(9L)).thenReturn(Optional.empty());
        when(userRepository.getReferenceById(9L)).thenReturn(user);
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertThatThrownBy(() -> cartService.addItem(9L, new AddToCartRequest(1L, 6)))
                .isInstanceOf(InsufficientStockException.class);
        verify(cartRepository, never()).save(argThat(cart -> !cart.getItems().isEmpty()));
    }

    @Test
    void updateItemChangesQuantityAndRemoveItemDeletesIt() {
        Cart cart = Cart.builder().id(3L).user(user).build();
        CartItem item = CartItem.builder().id(4L).cart(cart).product(product).quantity(1).build();
        cart.getItems().add(item);
        when(cartRepository.findByUserId(9L)).thenReturn(Optional.of(cart));
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CartResponse updated = cartService.updateItem(9L, 1L, new UpdateCartItemRequest(3));

        assertThat(updated.items().get(0).quantity()).isEqualTo(3);
        assertThat(updated.subtotal()).isEqualByComparingTo("300.00");

        when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        CartResponse removed = cartService.removeItem(9L, 1L);
        assertThat(removed.items()).isEmpty();
        assertThat(removed.subtotal()).isEqualByComparingTo("0");
    }

    @Test
    void updateItemThrowsWhenProductIsNotInCart() {
        Cart cart = Cart.builder().id(3L).user(user).build();
        when(cartRepository.findByUserId(9L)).thenReturn(Optional.of(cart));

        assertThatThrownBy(() -> cartService.updateItem(9L, 1L, new UpdateCartItemRequest(1)))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
