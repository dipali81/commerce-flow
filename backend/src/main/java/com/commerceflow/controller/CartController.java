package com.commerceflow.controller;

import com.commerceflow.common.ApiResponse;
import com.commerceflow.dto.cart.AddToCartRequest;
import com.commerceflow.dto.cart.CartResponse;
import com.commerceflow.dto.cart.UpdateCartItemRequest;
import com.commerceflow.security.UserPrincipal;
import com.commerceflow.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ApiResponse<CartResponse> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok(cartService.getCart(principal.getId()));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AddToCartRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(cartService.addItem(principal.getId(), request), "Item added to cart"));
    }

    @PutMapping("/items/{productId}")
    public ApiResponse<CartResponse> updateItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        return ApiResponse.ok(cartService.updateItem(principal.getId(), productId, request),
                "Cart item updated");
    }

    @DeleteMapping("/items/{productId}")
    public ApiResponse<CartResponse> removeItem(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long productId
    ) {
        return ApiResponse.ok(cartService.removeItem(principal.getId(), productId), "Item removed from cart");
    }

    @DeleteMapping
    public ApiResponse<Void> clear(@AuthenticationPrincipal UserPrincipal principal) {
        cartService.clearCart(principal.getId());
        return ApiResponse.ok(null, "Cart cleared");
    }
}
