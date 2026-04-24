package com.example.customer.controller;

import com.example.customer.dto.CustomerDTO;
import com.example.customer.model.City;
import com.example.customer.model.Country;
import com.example.customer.repository.CityRepository;
import com.example.customer.repository.CountryRepository;
import com.example.customer.repository.CustomerRepository;
import com.example.customer.service.BulkCustomerService;
import com.example.customer.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class CustomerController {
    private final CustomerService customerService;
    private final BulkCustomerService bulkCustomerService;
    private final CountryRepository countryRepository;
    private final CityRepository cityRepository;
    private final CustomerRepository customerRepository;

    @GetMapping
    public ResponseEntity<Page<CustomerDTO>> getAllCustomers(
            @RequestParam(required = false) String query,
            Pageable pageable) {
        return ResponseEntity.ok(customerService.getAllCustomers(query, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping
    public ResponseEntity<CustomerDTO> createCustomer(@RequestBody CustomerDTO dto) {
        return ResponseEntity.ok(customerService.createCustomer(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CustomerDTO> updateCustomer(@PathVariable Long id, @RequestBody CustomerDTO dto) {
        return ResponseEntity.ok(customerService.updateCustomer(id, dto));
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadBulk(@RequestParam("file") MultipartFile file) throws IOException {
        bulkCustomerService.processBulkUpload(file.getBytes());
        return ResponseEntity.ok("File uploaded and processing started in background.");
    }

    @GetMapping("/debug/counts")
    public ResponseEntity<Map<String, Long>> getCounts() {
        Map<String, Long> counts = new HashMap<>();
        counts.put("customers", customerRepository.count());
        counts.put("countries", countryRepository.count());
        counts.put("cities", cityRepository.count());
        return ResponseEntity.ok(counts);
    }

    @GetMapping("/countries")
    public ResponseEntity<List<Country>> getCountries() {
        List<Country> countries = countryRepository.findAll();
        log.info("Fetching countries, found: {}", countries.size());
        return ResponseEntity.ok(countries);
    }

    @GetMapping("/cities")
    public ResponseEntity<List<City>> getCities(@RequestParam Long countryId) {
        Country country = countryRepository.findById(countryId)
                .orElseThrow(() -> new RuntimeException("Country not found"));
        List<City> cities = cityRepository.findByCountry(country);
        log.info("Fetching cities for country {}, found: {}", countryId, cities.size());
        return ResponseEntity.ok(cities);
    }
}
