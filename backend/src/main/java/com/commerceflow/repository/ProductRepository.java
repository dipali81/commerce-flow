package com.commerceflow.repository;

import com.commerceflow.domain.product.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
            select p from Product p
            where p.active = true
              and (:term is null or :term = '' or
                   lower(p.name) like lower(concat('%', :term, '%')) or
                   lower(p.sku) like lower(concat('%', :term, '%')) or
                   lower(p.category) like lower(concat('%', :term, '%')) or
                   lower(p.description) like lower(concat('%', :term, '%')))
              and (:category is null or :category = '' or lower(p.category) = lower(:category))
              and (:minPrice is null or p.price >= :minPrice)
              and (:maxPrice is null or p.price <= :maxPrice)
            """)
    Page<Product> search(@Param("term") String term,
                         @Param("category") String category,
                         @Param("minPrice") BigDecimal minPrice,
                         @Param("maxPrice") BigDecimal maxPrice,
                         Pageable pageable);

    Optional<Product> findBySku(String sku);

    @Modifying(flushAutomatically = true)
    @Query("""
            update Product p
            set p.stockQuantity = p.stockQuantity - :quantity
            where p.id = :productId
              and p.active = true
              and p.stockQuantity >= :quantity
            """)
    int decrementStock(@Param("productId") Long productId, @Param("quantity") int quantity);

    @Modifying(flushAutomatically = true)
    @Query("update Product p set p.stockQuantity = p.stockQuantity + :quantity where p.id = :productId")
    int increaseStock(@Param("productId") Long productId, @Param("quantity") int quantity);
}
