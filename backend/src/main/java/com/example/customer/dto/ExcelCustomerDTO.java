package com.example.customer.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import lombok.Data;

@Data
public class ExcelCustomerDTO {
    @ExcelProperty("Name")
    private String name;

    @ExcelProperty("Date of Birth")
    private String dob;

    @ExcelProperty("NIC")
    private String nic;

    @ExcelProperty("Mobile Numbers")
    private String mobiles; // Semicolon separated

    @ExcelProperty("Address Line 1")
    private String addressLine1;

    @ExcelProperty("Address Line 2")
    private String addressLine2;

    @ExcelProperty("City")
    private String city;

    @ExcelProperty("Country")
    private String country;
}
