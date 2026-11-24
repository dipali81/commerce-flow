package com.commerceflow.config;

import com.commerceflow.domain.product.Product;
import com.commerceflow.domain.user.Role;
import com.commerceflow.domain.user.User;
import com.commerceflow.repository.ProductRepository;
import com.commerceflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements ApplicationRunner {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        seedUser("admin@commerceflow.dev", "Admin User", "Admin@123", Role.ROLE_ADMIN);
        seedUser("shopper@commerceflow.dev", "Demo Shopper", "Shopper@123", Role.ROLE_USER);

        if (productRepository.count() > 0) {
            return;
        }

        productRepository.saveAll(List.of(
                product("LAPTOP-001", "AeroBook 14 Laptop", "Electronics", new BigDecimal("74999.00"), 12,
                        "Lightweight 14-inch laptop with 16GB RAM and 512GB SSD."),
                product("PHONE-001", "PixelPro Smartphone", "Electronics", new BigDecimal("49999.00"), 20,
                        "6.7-inch AMOLED display, 256GB storage and all-day battery."),
                product("HEAD-001", "Studio Wireless Headphones", "Electronics", new BigDecimal("12999.00"), 35,
                        "Noise-cancelling over-ear headphones with 40-hour battery life."),
                product("CHAIR-001", "Ergo Office Chair", "Furniture", new BigDecimal("18499.00"), 8,
                        "Adjustable ergonomic chair with lumbar support."),
                product("DESK-001", "Standing Desk 120cm", "Furniture", new BigDecimal("22999.00"), 6,
                        "Height-adjustable desk with cable management tray."),
                product("BOOK-001", "Clean Architecture in Practice", "Books", new BigDecimal("899.00"), 50,
                        "A practical guide to layered and hexagonal architecture."),
                product("BOOK-002", "Designing Data-Intensive Systems", "Books", new BigDecimal("1199.00"), 40,
                        "Reliable, scalable and maintainable data systems."),
                product("BAG-001", "Everyday Backpack 25L", "Accessories", new BigDecimal("2499.00"), 30,
                        "Water-resistant backpack with padded laptop compartment."),
                product("WATCH-001", "Pulse Fitness Watch", "Accessories", new BigDecimal("8999.00"), 18,
                        "Fitness tracker with GPS, SpO2 and sleep monitoring."),
                product("CAM-001", "Compact Mirrorless Camera", "Electronics", new BigDecimal("64999.00"), 5,
                        "24MP mirrorless camera with 4K video and kit lens."),
                product("LAMP-001", "LED Desk Lamp", "Furniture", new BigDecimal("1799.00"), 45,
                        "Dimmable warm/cool desk lamp with USB charging port."),
                product("MOUSE-001", "Wireless Ergonomic Mouse", "Accessories", new BigDecimal("1999.00"), 60,
                        "Silent clicks, adjustable DPI and a comfortable grip.")
        ));

        log.info("Seeded {} products and demo users for local development", productRepository.count());
    }

    private void seedUser(String email, String fullName, String rawPassword, Role role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        userRepository.save(User.builder()
                .email(email)
                .fullName(fullName)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .role(role)
                .enabled(true)
                .build());
    }

    private Product product(String sku, String name, String category, BigDecimal price,
                            int stock, String description) {
        return Product.builder()
                .sku(sku)
                .name(name)
                .category(category)
                .price(price)
                .stockQuantity(stock)
                .description(description)
                .imageUrl(null)
                .active(true)
                .build();
    }
}
