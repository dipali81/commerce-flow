package com.commerceflow.service.impl;

import com.commerceflow.common.PagedResponse;
import com.commerceflow.domain.cart.Cart;
import com.commerceflow.domain.cart.CartItem;
import com.commerceflow.domain.event.OrderPlacedEvent;
import com.commerceflow.domain.order.Order;
import com.commerceflow.domain.order.OrderItem;
import com.commerceflow.domain.order.OrderStatus;
import com.commerceflow.domain.product.Product;
import com.commerceflow.domain.user.User;
import com.commerceflow.dto.order.CheckoutRequest;
import com.commerceflow.dto.order.OrderResponse;
import com.commerceflow.exception.BadRequestException;
import com.commerceflow.exception.InsufficientStockException;
import com.commerceflow.exception.ResourceNotFoundException;
import com.commerceflow.mapper.OrderMapper;
import com.commerceflow.repository.CartRepository;
import com.commerceflow.repository.OrderRepository;
import com.commerceflow.repository.ProductRepository;
import com.commerceflow.repository.UserRepository;
import com.commerceflow.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final int MAX_PAGE_SIZE = 100;

    private final CartRepository cartRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public OrderResponse checkout(Long userId, CheckoutRequest request) {
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Your cart is empty"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Your cart is empty");
        }

        User user = userRepository.getReferenceById(userId);
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            Product product = cartItem.getProduct();
            if (!product.isActive()) {
                throw new BadRequestException("Product '" + product.getSku() + "' is no longer available");
            }

            int quantity = cartItem.getQuantity();
            int updatedRows = productRepository.decrementStock(product.getId(), quantity);
            if (updatedRows != 1) {
                throw new InsufficientStockException(
                        "Insufficient stock for '" + product.getName() + "'. Please update your cart.");
            }

            BigDecimal lineTotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
            orderItems.add(OrderItem.builder()
                    .product(product)
                    .productSku(product.getSku())
                    .productName(product.getName())
                    .unitPrice(product.getPrice())
                    .quantity(quantity)
                    .lineTotal(lineTotal)
                    .build());
            total = total.add(lineTotal);
        }

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .status(OrderStatus.CONFIRMED)
                .totalAmount(total)
                .shippingLine1(request.shippingLine1().trim())
                .shippingLine2(request.shippingLine2() == null ? null : request.shippingLine2().trim())
                .city(request.city().trim())
                .postalCode(request.postalCode().trim())
                .country(request.country().trim())
                .placedAt(LocalDateTime.now())
                .build();
        orderItems.forEach(order::addItem);

        Order saved = orderRepository.saveAndFlush(order);
        cart.clear();
        cartRepository.save(cart);

        eventPublisher.publishEvent(OrderPlacedEvent.of(
                saved.getOrderNumber(), saved.getId(), user.getEmail(), saved.getTotalAmount()));
        log.info("Order {} confirmed for user {} with total {}", saved.getOrderNumber(), userId, total);

        return OrderMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<OrderResponse> history(Long userId, int page, int size) {
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new BadRequestException("Invalid pagination parameters");
        }
        Page<Order> orders = orderRepository.findByUserIdOrderByPlacedAtDesc(
                userId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "placedAt")));
        return new PagedResponse<>(
                orders.getContent().stream().map(OrderMapper::toResponse).toList(),
                orders.getNumber(),
                orders.getSize(),
                orders.getTotalElements(),
                orders.getTotalPages(),
                orders.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getByOrderNumber(Long userId, String orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderNumber));
        if (!order.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Order", orderNumber);
        }
        return OrderMapper.toResponse(order);
    }

    private String generateOrderNumber() {
        String random = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return "ORD-" + random + "-" + System.currentTimeMillis();
    }
}
