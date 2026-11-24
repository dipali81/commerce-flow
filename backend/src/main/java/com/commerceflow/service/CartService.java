package com.commerceflow.service;

import com.commerceflow.dto.cart.AddToCartRequest;
import com.commerceflow.dto.cart.CartResponse;
import com.commerceflow.dto.cart.UpdateCartItemRequest;

public interface CartService {

    CartResponse getCart(Long userId);

    CartResponse addItem(Long userId, AddToCartRequest request);

    CartResponse updateItem(Long userId, Long productId, UpdateCartItemRequest request);

    CartResponse removeItem(Long userId, Long productId);

    void clearCart(Long userId);
}
