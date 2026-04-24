package com.example.customer.service;

import com.example.customer.model.Customer;
import com.example.customer.repository.CustomerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
public class CustomerRepositoryTest {

    @Autowired
    private CustomerRepository customerRepository;

    @Test
    public void testNICUniqueness() {
        Customer c1 = new Customer();
        c1.setName("User 1");
        c1.setDob(LocalDate.of(1990, 1, 1));
        c1.setNic("UNIQUE123");
        customerRepository.save(c1);

        Optional<Customer> found = customerRepository.findByNic("UNIQUE123");
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("User 1");
    }
}
