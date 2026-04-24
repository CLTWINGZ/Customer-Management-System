package com.example.customer.repository;

import com.example.customer.model.City;
import com.example.customer.model.Country;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface CityRepository extends JpaRepository<City, Long> {
    Optional<City> findByNameAndCountry(String name, Country country);
    List<City> findByCountry(Country country);
}
