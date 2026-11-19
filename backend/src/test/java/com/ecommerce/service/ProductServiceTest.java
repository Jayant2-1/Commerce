package com.ecommerce.service;

import com.ecommerce.entity.Product;
import com.ecommerce.exception.ConflictException;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.InventoryRepository;
import com.ecommerce.repository.OrderItemRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.mapper.ProductMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductService productService;

    @Test
    void refusesToDeleteProductsReferencedByOrderHistory() {
        UUID productId = UUID.randomUUID();
        Product product = Product.builder().build();
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(orderItemRepository.existsByProductId(productId)).thenReturn(true);

        assertThatThrownBy(() -> productService.deleteProduct(productId))
                .isInstanceOf(ConflictException.class)
                .hasMessage("Cannot delete a product included in existing orders");
        verify(productRepository, never()).delete(product);
    }

    @Test
    void deletesProductsWithoutOrderHistory() {
        UUID productId = UUID.randomUUID();
        Product product = Product.builder().build();
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(orderItemRepository.existsByProductId(productId)).thenReturn(false);

        productService.deleteProduct(productId);

        verify(productRepository).delete(product);
    }
}
