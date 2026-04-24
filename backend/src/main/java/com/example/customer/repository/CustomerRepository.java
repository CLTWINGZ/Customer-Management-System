package com.example.customer.repository;

import com.example.customer.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByNic(String nic);

    @EntityGraph(attributePaths = {"mobiles", "addresses"})
    Page<Customer> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"mobiles", "addresses"})
    Page<Customer> findByNameContainingIgnoreCaseOrNicContainingIgnoreCase(String name, String nic, Pageable pageable);
}
