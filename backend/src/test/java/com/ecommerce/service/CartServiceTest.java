package com.ecommerce.service;

import com.ecommerce.dto.request.AddCartItemRequest;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.entity.Cart;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Inventory;
import com.ecommerce.entity.Product;
import com.ecommerce.mapper.CartMapper;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.InventoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CartServiceTest {

    @Test
    void addItemIncludesTheNewItemInTheImmediateCartResponse() {
        UUID userId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        Cart cart = Cart.builder().items(new ArrayList<>()).build();
        Product product = Product.builder()
                .name("Test Product")
                .slug("test-product")
                .price(new BigDecimal("125.00"))
                .active(true)
                .sku("TEST-1")
                .build();
        product.setId(productId);
        Inventory inventory = Inventory.builder()
                .product(product)
                .sku("TEST-1")
                .stockQuantity(5)
                .reservedQuantity(0)
                .soldQuantity(0)
                .lowStockThreshold(1)
                .inStock(true)
                .build();

        CartRepository carts = mock(CartRepository.class);
        CartItemRepository cartItems = mock(CartItemRepository.class);
        ProductRepository products = mock(ProductRepository.class);
        InventoryRepository inventories = mock(InventoryRepository.class);
        UserRepository users = mock(UserRepository.class);
        when(carts.findByUserId(userId)).thenReturn(Optional.of(cart));
        when(products.findById(productId)).thenReturn(Optional.of(product));
        when(inventories.findByProductId(productId)).thenReturn(Optional.of(inventory));
        when(cartItems.findByCartIdAndProductId(cart.getId(), productId)).thenReturn(Optional.empty());
        when(cartItems.save(any(CartItem.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(inventories.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CartService service = new CartService(
                carts,
                cartItems,
                products,
                inventories,
                users,
                new CartMapper(new ProductMapper())
        );

        CartResponse response = service.addItem(userId, new AddCartItemRequest(productId, 2));

        assertThat(response.items()).hasSize(1);
        assertThat(response.items().getFirst().product().name()).isEqualTo("Test Product");
        assertThat(response.items().getFirst().subtotal()).isEqualByComparingTo("250.00");
        assertThat(response.subtotal()).isEqualByComparingTo("250.00");
    }
}
