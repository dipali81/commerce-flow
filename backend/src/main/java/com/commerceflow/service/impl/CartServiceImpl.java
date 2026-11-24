package com.commerceflow.service.impl;

import com.commerceflow.domain.cart.Cart;
import com.commerceflow.domain.cart.CartItem;
import com.commerceflow.domain.product.Product;
import com.commerceflow.domain.user.User;
import com.commerceflow.dto.cart.AddToCartRequest;
import com.commerceflow.dto.cart.CartResponse;
import com.commerceflow.dto.cart.UpdateCartItemRequest;
import com.commerceflow.exception.BadRequestException;
import com.commerceflow.exception.InsufficientStockException;
import com.commerceflow.exception.ResourceNotFoundException;
import com.commerceflow.mapper.CartMapper;
import com.commerceflow.repository.CartRepository;
import com.commerceflow.repository.ProductRepository;
import com.commerceflow.repository.UserRepository;
import com.commerceflow.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public CartResponse getCart(Long userId) {
        return CartMapper.toResponse(cartRepository.findByUserId(userId).orElseGet(this::emptyCart));
    }

    @Override
    @Transactional
    public CartResponse addItem(Long userId, AddToCartRequest request) {
        Product product = findActiveProduct(request.productId());
        Cart cart = getOrCreateCart(userId);
        int currentQuantity = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .mapToInt(CartItem::getQuantity)
                .sum();
        ensureStockAvailable(product, currentQuantity + (long) request.quantity());

        cart.addItem(product, request.quantity());
        return CartMapper.toResponse(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartResponse updateItem(Long userId, Long productId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        CartItem item = cart.getItems().stream()
                .filter(cartItem -> cartItem.getProduct().getId().equals(productId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", productId));
        ensureStockAvailable(item.getProduct(), request.quantity());

        cart.updateItem(item.getProduct(), request.quantity());
        return CartMapper.toResponse(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public CartResponse removeItem(Long userId, Long productId) {
        Cart cart = getOrCreateCart(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
        cart.removeItem(product);
        return CartMapper.toResponse(cartRepository.save(cart));
    }

    @Override
    @Transactional
    public void clearCart(Long userId) {
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.clear();
            cartRepository.save(cart);
        });
    }

    private Cart getOrCreateCart(Long userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.getReferenceById(userId);
            return cartRepository.save(Cart.builder().user(user).build());
        });
    }

    private Cart emptyCart() {
        return Cart.builder().build();
    }

    private Product findActiveProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));
        if (!product.isActive()) {
            throw new BadRequestException("Product '" + product.getSku() + "' is not available");
        }
        return product;
    }

    private void ensureStockAvailable(Product product, long requestedQuantity) {
        if (requestedQuantity > Integer.MAX_VALUE || requestedQuantity > product.getStockQuantity()) {
            throw new InsufficientStockException(
                    "Only " + product.getStockQuantity() + " units of '" + product.getName() + "' are available");
        }
    }
}
