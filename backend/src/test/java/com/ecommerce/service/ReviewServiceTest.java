package com.ecommerce.service;

import com.ecommerce.entity.Product;
import com.ecommerce.entity.Review;
import com.ecommerce.enums.ReviewStatus;
import com.ecommerce.mapper.ReviewMapper;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ReviewRepository;
import com.ecommerce.repository.UserRepository;
import org.junit.jupiter.api.Test;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReviewServiceTest {

    @Test
    void moderationRecalculatesProductRatingFromAggregateRow() {
        UUID reviewId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        Product product = Product.builder().name("Test product").slug("test-product").build();
        product.setId(productId);
        Review review = Review.builder().product(product).rating(5).status(ReviewStatus.PENDING).build();
        ReviewRepository reviews = mock(ReviewRepository.class);
        ProductRepository products = mock(ProductRepository.class);
        ReviewMapper mapper = mock(ReviewMapper.class);
        ReviewService service = new ReviewService(
                reviews,
                products,
                mock(UserRepository.class),
                mapper,
                mock(OrderService.class)
        );
        when(reviews.findById(reviewId)).thenReturn(Optional.of(review));
        when(reviews.save(review)).thenReturn(review);
        when(reviews.findRatingStats(productId, ReviewStatus.APPROVED))
                .thenReturn(Collections.singletonList(new Object[]{4.5, 2L}));
        when(products.save(product)).thenReturn(product);

        service.moderateReview(reviewId, ReviewStatus.APPROVED);

        assertThat(product.getAvgRating()).isEqualTo(4.5);
        assertThat(product.getTotalReviews()).isEqualTo(2);
        verify(products).save(product);
    }
}
