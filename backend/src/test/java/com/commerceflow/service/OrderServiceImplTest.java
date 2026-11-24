package com.commerceflow.service;

import com.commerceflow.domain.cart.Cart;
import com.commerceflow.domain.cart.CartItem;
import com.commerceflow.domain.event.OrderPlacedEvent;
import com.commerceflow.domain.order.Order;
import com.commerceflow.domain.order.OrderStatus;
import com.commerceflow.domain.product.Product;
import com.commerceflow.domain.user.Role;
import com.commerceflow.domain.user.User;
import com.commerceflow.dto.order.CheckoutRequest;
import com.commerceflow.dto.order.OrderResponse;
import com.commerceflow.exception.InsufficientStockException;
import com.commerceflow.repository.CartRepository;
import com.commerceflow.repository.OrderRepository;
import com.commerceflow.repository.ProductRepository;
import com.commerceflow.repository.UserRepository;
import com.commerceflow.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrderServiceImplTest {

    @Mock
    private CartRepository cartRepository;
    @Mock
    private OrderRepository orderRepository;
    @Mock
    private ProductRepository productRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ApplicationEventPublisher eventPublisher;
    @InjectMocks
    private OrderServiceImpl orderService;

    private Cart cart;
    private CheckoutRequest checkoutRequest;

    @BeforeEach
    void setUp() {
        User user = User.builder().id(9L).email("user@example.com").role(Role.ROLE_USER).build();
        Product product = Product.builder()
                .id(1L)
                .sku("SKU-1")
                .name("Sample product")
                .price(new BigDecimal("100.00"))
                .stockQuantity(5)
                .active(true)
                .build();
        cart = Cart.builder().id(3L).user(user).build();
        CartItem item = CartItem.builder().id(4L).cart(cart).product(product).quantity(2).build();
        cart.getItems().add(item);
        checkoutRequest = new CheckoutRequest("12 Main St", "Apt 4", "Bengaluru", "560001", "India");
    }

    @Test
    void checkoutDecrementsStockCreatesOrderClearsCartAndPublishesEvent() {
        when(cartRepository.findByUserId(9L)).thenReturn(Optional.of(cart));
        when(userRepository.getReferenceById(9L)).thenReturn(cart.getUser());
        when(productRepository.decrementStock(1L, 2)).thenReturn(1);
        when(orderRepository.saveAndFlush(any(Order.class))).thenAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            order.setId(100L);
            return order;
        });
        when(cartRepository.save(any(Cart.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = orderService.checkout(9L, checkoutRequest);

        assertThat(response.orderNumber()).startsWith("ORD-");
        assertThat(response.status()).isEqualTo(OrderStatus.CONFIRMED);
        assertThat(response.totalAmount()).isEqualByComparingTo("200.00");
        assertThat(response.items()).hasSize(1);
        assertThat(cart.getItems()).isEmpty();
        verify(productRepository).decrementStock(1L, 2);
        verify(eventPublisher).publishEvent(any(OrderPlacedEvent.class));
    }

    @Test
    void checkoutStopsWhenStockUpdateFails() {
        when(cartRepository.findByUserId(9L)).thenReturn(Optional.of(cart));
        when(userRepository.getReferenceById(9L)).thenReturn(cart.getUser());
        when(productRepository.decrementStock(1L, 2)).thenReturn(0);

        assertThatThrownBy(() -> orderService.checkout(9L, checkoutRequest))
                .isInstanceOf(InsufficientStockException.class);
        verify(orderRepository, never()).saveAndFlush(any());
        verify(eventPublisher, never()).publishEvent(any());
    }
}
