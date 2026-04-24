package com.example.customer.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class CustomerDTO {
    private Long id;
    private String name;
    private LocalDate dob;
    private String nic;
    private List<String> mobiles;
    private List<AddressDTO> addresses;
    private List<Long> familyMemberIds;
}
