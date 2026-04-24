package com.example.customer.dto;

import lombok.Data;

@Data
public class AddressDTO {
    private String addressLine1;
    private String addressLine2;
    private Long cityId;
    private String cityName;
    private Long countryId;
    private String countryName;
}
