package com.ecommerce.config;

import com.ecommerce.entity.Cart;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.Review;
import com.ecommerce.entity.User;
import com.ecommerce.entity.Wishlist;
import com.ecommerce.enums.ReviewStatus;
import com.ecommerce.enums.Role;
import com.ecommerce.repository.CartRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ReviewRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@Profile("dev")
@ConditionalOnProperty(name = "app.demo-data.enabled", havingValue = "true")
@RequiredArgsConstructor
public class DemoDataSeeder implements ApplicationRunner {

    private static final List<String> REVIEW_TITLES = List.of(
            "Beautifully made",
            "A lovely addition",
            "Exactly what I wanted"
    );
    private static final List<String> REVIEW_BODIES = List.of(
            "The quality and finish are excellent, and it looks just like the product photos.",
            "A thoughtful design with great attention to detail. I am very happy with this purchase.",
            "It feels well made, works as expected, and is great value for the price."
    );
    private static final List<Integer> REVIEW_RATINGS = List.of(5, 4, 5);

    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final WishlistRepository wishlistRepository;

    @Value("${app.demo-data.admin-password}")
    private String adminPassword;

    @Value("${app.demo-data.customer-password}")
    private String customerPassword;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        User admin = ensureUser("admin@commerce.local", "Commerce Admin", Role.ADMIN, adminPassword);
        List<User> customers = List.of(
                ensureUser("alex.morgan@commerce.local", "Alex Morgan", Role.USER, customerPassword),
                ensureUser("priya.shah@commerce.local", "Priya Shah", Role.USER, customerPassword),
                ensureUser("sam.taylor@commerce.local", "Sam Taylor", Role.USER, customerPassword),
                ensureUser("anaya.mehta@commerce.local", "Anaya Mehta", Role.USER, customerPassword)
        );
        ensureCartAndWishlist(admin);
        customers.forEach(this::ensureCartAndWishlist);

        List<Product> products = productRepository.findAll();
        if (products.isEmpty()) {
            log.warn("Demo data seeding found no products; approved review examples could not be created.");
            return;
        }

        int reviewsCreated = 0;
        for (Product product : products) {
            for (int reviewerIndex = 0; reviewerIndex < 3; reviewerIndex++) {
                User reviewer = customers.get(reviewerIndex);
                if (reviewRepository.findByUserIdAndProductId(reviewer.getId(), product.getId()).isPresent()) {
                    continue;
                }

                reviewRepository.save(Review.builder()
                        .user(reviewer)
                        .product(product)
                        .rating(REVIEW_RATINGS.get(reviewerIndex))
                        .title(REVIEW_TITLES.get(reviewerIndex))
                        .body(REVIEW_BODIES.get(reviewerIndex))
                        .status(ReviewStatus.APPROVED)
                        .isVerifiedPurchase(false)
                        .build());
                reviewsCreated++;
            }

            List<Object[]> ratingStatsRows = reviewRepository.findRatingStats(product.getId(), ReviewStatus.APPROVED);
            Object[] ratingStats = ratingStatsRows.isEmpty() ? null : ratingStatsRows.get(0);
            double averageRating = ratingStats == null || ratingStats[0] == null
                    ? 0.0
                    : ((Number) ratingStats[0]).doubleValue();
            int totalReviews = ratingStats == null || ratingStats[1] == null
                    ? 0
                    : ((Number) ratingStats[1]).intValue();
            product.setAvgRating(averageRating);
            product.setTotalReviews(totalReviews);
            productRepository.save(product);
        }

        log.info("Development demo data is ready: 5 sample users and {} new approved reviews across {} products.",
                reviewsCreated, products.size());
    }

    private User ensureUser(String email, String fullName, Role role, String rawPassword) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> userRepository.save(User.builder()
                        .fullName(fullName)
                        .email(email)
                        .password(passwordEncoder.encode(rawPassword))
                        .role(role)
                        .isActive(true)
                        .isEmailVerified(true)
                        .build()));
    }

    private void ensureCartAndWishlist(User user) {
        if (cartRepository.findByUserId(user.getId()).isEmpty()) {
            cartRepository.save(Cart.builder().user(user).build());
        }
        if (!wishlistRepository.existsByUserIdAndNameIgnoreCase(user.getId(), "My Wishlist")) {
            wishlistRepository.save(Wishlist.builder().user(user).name("My Wishlist").build());
        }
    }
}
