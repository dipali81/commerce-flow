package com.commerceflow.domain.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventListener {

    @Async("eventTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderPlaced(OrderPlacedEvent event) {
        // In a distributed deployment this is where an outbox publisher would emit to Kafka/SQS.
        log.info("ORDER_PLACED event consumed asynchronously: orderNumber={}, orderId={}, customer={}, amount={}, at={}",
                event.orderNumber(), event.orderId(), event.customerEmail(), event.amount(), event.occurredAt());
    }
}
