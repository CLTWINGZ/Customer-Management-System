package com.example.customer.service;

import com.example.customer.dto.AddressDTO;
import com.example.customer.dto.CustomerDTO;
import com.example.customer.model.Address;
import com.example.customer.model.City;
import com.example.customer.model.Customer;
import com.example.customer.repository.CityRepository;
import com.example.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private final CustomerRepository customerRepository;
    private final CityRepository cityRepository;

    @Transactional(readOnly = true)
    public Page<CustomerDTO> getAllCustomers(String query, Pageable pageable) {
        if (query != null && !query.trim().isEmpty()) {
            return customerRepository.findByNameContainingIgnoreCaseOrNicContainingIgnoreCase(query, query, pageable)
                    .map(this::convertToDTO);
        }
        return customerRepository.findAll(pageable).map(this::convertToDTO);
    }

    @Transactional(readOnly = true)
    public CustomerDTO getCustomerById(Long id) {
        return customerRepository.findById(id).map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
    }

    @Transactional
    public CustomerDTO createCustomer(CustomerDTO dto) {
        Customer customer = new Customer();
        updateCustomerFromDTO(customer, dto);
        return convertToDTO(customerRepository.save(customer));
    }

    @Transactional
    public CustomerDTO updateCustomer(Long id, CustomerDTO dto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        updateCustomerFromDTO(customer, dto);
        return convertToDTO(customerRepository.save(customer));
    }

    private void updateCustomerFromDTO(Customer customer, CustomerDTO dto) {
        customer.setName(dto.getName());
        customer.setDob(dto.getDob());
        customer.setNic(dto.getNic());
        if (dto.getMobiles() != null) {
            customer.setMobiles(dto.getMobiles().stream()
                .filter(m -> m != null && !m.trim().isEmpty())
                .collect(Collectors.toSet()));
        }

        // Update addresses
        customer.getAddresses().clear();
        if (dto.getAddresses() != null) {
            for (AddressDTO addrDto : dto.getAddresses()) {
                if (addrDto.getCityId() == null) continue; // Skip if no city selected
                
                Address address = new Address();
                address.setAddressLine1(addrDto.getAddressLine1());
                address.setAddressLine2(addrDto.getAddressLine2());
                City city = cityRepository.findById(addrDto.getCityId())
                        .orElseThrow(() -> new RuntimeException("City not found: " + addrDto.getCityId()));
                address.setCity(city);
                address.setCustomer(customer);
                customer.getAddresses().add(address);
            }
        }

        // Update family members
        customer.getFamilyMembers().clear();
        if (dto.getFamilyMemberIds() != null) {
            List<Customer> family = customerRepository.findAllById(dto.getFamilyMemberIds());
            customer.setFamilyMembers(family);
        }
    }

    private CustomerDTO convertToDTO(Customer customer) {
        CustomerDTO dto = new CustomerDTO();
        dto.setId(customer.getId());
        dto.setName(customer.getName());
        dto.setDob(customer.getDob());
        dto.setNic(customer.getNic());
        dto.setMobiles(new ArrayList<>(customer.getMobiles()));
        dto.setAddresses(customer.getAddresses().stream().map(addr -> {
            AddressDTO aDto = new AddressDTO();
            aDto.setAddressLine1(addr.getAddressLine1());
            aDto.setAddressLine2(addr.getAddressLine2());
            aDto.setCityId(addr.getCity().getId());
            aDto.setCityName(addr.getCity().getName());
            aDto.setCountryId(addr.getCity().getCountry().getId());
            aDto.setCountryName(addr.getCity().getCountry().getName());
            return aDto;
        }).collect(Collectors.toList()));
        dto.setFamilyMemberIds(customer.getFamilyMembers().stream().map(Customer::getId).collect(Collectors.toList()));
        return dto;
    }
}
