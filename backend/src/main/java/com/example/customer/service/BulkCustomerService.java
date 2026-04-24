package com.example.customer.service;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.context.AnalysisContext;
import com.alibaba.excel.read.listener.ReadListener;
import com.example.customer.dto.ExcelCustomerDTO;
import com.example.customer.model.Customer;
import com.example.customer.repository.CityRepository;
import com.example.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BulkCustomerService {
    private final CustomerRepository customerRepository;
    private final CityRepository cityRepository;
    private final JdbcTemplate jdbcTemplate;

    private static final int BATCH_SIZE = 1000;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Async
    public void processBulkUpload(byte[] fileBytes) {
        log.info("Starting bulk upload processing from memory...");
        try (InputStream inputStream = new ByteArrayInputStream(fileBytes)) {
            EasyExcel.read(inputStream, ExcelCustomerDTO.class, new ReadListener<ExcelCustomerDTO>() {
                private List<ExcelCustomerDTO> cachedDataList = new ArrayList<>(BATCH_SIZE);

                @Override
                public void invoke(ExcelCustomerDTO data, AnalysisContext context) {
                    cachedDataList.add(data);
                    if (cachedDataList.size() >= BATCH_SIZE) {
                        saveDataBatch();
                        cachedDataList.clear();
                    }
                }

                @Override
                public void doAfterAllAnalysed(AnalysisContext context) {
                    saveDataBatch();
                    log.info("Bulk upload processing completed.");
                }

                private void saveDataBatch() {
                    if (cachedDataList.isEmpty()) return;
                    saveBatchInternal(cachedDataList);
                }
            }).sheet().doRead();
        } catch (Exception e) {
            log.error("Global error in bulk upload: ", e);
        }
    }

    @Transactional
    public void saveBatchInternal(List<ExcelCustomerDTO> batch) {
        Map<String, Long> cityMap = cityRepository.findAll().stream()
            .collect(Collectors.toMap(c -> c.getName().trim().toLowerCase(), c -> c.getId(), (a, b) -> a));

        for (ExcelCustomerDTO dto : batch) {
            try {
                if (dto.getNic() == null || dto.getNic().trim().isEmpty()) continue;

                Optional<Customer> existing = customerRepository.findByNic(dto.getNic().trim());
                Long customerId;

                if (existing.isPresent()) {
                    Customer customer = existing.get();
                    customer.setName(dto.getName());
                    customer.setDob(LocalDate.parse(dto.getDob(), DATE_FORMATTER));
                    customerRepository.save(customer);
                    customerId = customer.getId();
                } else {
                    KeyHolder keyHolder = new GeneratedKeyHolder();
                    jdbcTemplate.update(connection -> {
                        PreparedStatement ps = connection.prepareStatement(
                            "INSERT INTO customer (name, dob, nic) VALUES (?, ?, ?)",
                            Statement.RETURN_GENERATED_KEYS
                        );
                        ps.setString(1, dto.getName());
                        ps.setObject(2, LocalDate.parse(dto.getDob(), DATE_FORMATTER));
                        ps.setString(3, dto.getNic().trim());
                        return ps;
                    }, keyHolder);
                    customerId = keyHolder.getKey().longValue();
                }

                // Process Mobiles
                if (dto.getMobiles() != null && !dto.getMobiles().trim().isEmpty()) {
                    jdbcTemplate.update("DELETE FROM customer_mobiles WHERE customer_id = ?", customerId);
                    String[] mobileArray = dto.getMobiles().split(";");
                    for (String mobile : mobileArray) {
                        if (!mobile.trim().isEmpty()) {
                            jdbcTemplate.update("INSERT INTO customer_mobiles (customer_id, mobile_number) VALUES (?, ?)", 
                                customerId, mobile.trim());
                        }
                    }
                }

                // Process Address
                if (dto.getCity() != null && !dto.getCity().trim().isEmpty()) {
                    String cityName = dto.getCity().trim().toLowerCase();
                    if (cityMap.containsKey(cityName)) {
                        Long cityId = cityMap.get(cityName);
                        jdbcTemplate.update("DELETE FROM address WHERE customer_id = ?", customerId);
                        jdbcTemplate.update(
                            "INSERT INTO address (address_line1, address_line2, city_id, customer_id) VALUES (?, ?, ?, ?)",
                            dto.getAddressLine1(), dto.getAddressLine2(), cityId, customerId
                        );
                    } else {
                        log.warn("City not found in master data: {}", dto.getCity());
                    }
                }

            } catch (Exception e) {
                log.error("Error processing row with NIC: {}. Error: {}", dto.getNic(), e.getMessage());
            }
        }
    }
}
