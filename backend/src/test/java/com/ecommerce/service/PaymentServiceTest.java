package com.ecommerce.service;

import com.ecommerce.config.PaymentConfig;
import com.ecommerce.dto.request.PaymentInitiateRequest;
import com.ecommerce.dto.response.PaymentResponse;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.Payment;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.enums.PaymentMethod;
import com.ecommerce.enums.PaymentStatus;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.PaymentRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PaymentServiceTest {

    @Test
    void mockCompleteMarksPaymentAndOrderAsCompleted() {
        UUID userId = UUID.randomUUID();
        UUID orderId = UUID.randomUUID();
        Order order = Order.builder()
                .finalPrice(new BigDecimal("125.00"))
                .orderStatus(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.PENDING)
                .build();
        PaymentRepository payments = mock(PaymentRepository.class);
        OrderRepository orders = mock(OrderRepository.class);
        NotificationService notifications = mock(NotificationService.class);
        PaymentService service = new PaymentService(
                orders,
                payments,
                new PaymentConfig(),
                notifications
        );
        when(orders.findByIdAndUserId(orderId, userId)).thenReturn(Optional.of(order));
        when(payments.findByOrderId(orderId)).thenReturn(Optional.empty());
        when(payments.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(orders.save(order)).thenReturn(order);

        PaymentResponse result = service.completeMockPayment(
                userId,
                new PaymentInitiateRequest(orderId, PaymentMethod.UPI)
        );

        assertThat(result.status()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(result.amount()).isEqualByComparingTo("125.00");
        assertThat(result.method()).isEqualTo(PaymentMethod.UPI);
        assertThat(order.getPaymentStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(order.getOrderStatus()).isEqualTo(OrderStatus.CONFIRMED);
        verify(orders).save(order);
    }
}
