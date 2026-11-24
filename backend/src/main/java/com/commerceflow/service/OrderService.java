package com.commerceflow.service;

import com.commerceflow.common.PagedResponse;
import com.commerceflow.dto.order.CheckoutRequest;
import com.commerceflow.dto.order.OrderResponse;

public interface OrderService {

    OrderResponse checkout(Long userId, CheckoutRequest request);

    PagedResponse<OrderResponse> history(Long userId, int page, int size);

    OrderResponse getByOrderNumber(Long userId, String orderNumber);
}
