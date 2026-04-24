package com.example.customer;

import com.example.customer.model.Customer;
import com.example.customer.repository.CustomerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class CustomerApplicationTests {

	@Autowired
	private CustomerRepository customerRepository;

	@Test
	void contextLoads() {
	}

	@Test
	void testCreateCustomer() {
		Customer customer = new Customer();
		customer.setName("John Doe");
		customer.setDob(LocalDate.of(1990, 1, 1));
		customer.setNic("123456789V");
		
		Customer saved = customerRepository.save(customer);
		assertThat(saved.getId()).isNotNull();
		assertThat(saved.getName()).isEqualTo("John Doe");
	}

}
