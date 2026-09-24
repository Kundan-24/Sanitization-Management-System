package com.sms.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class AdminReportFilterDto {
    private String search;
    private LocalDate date;
    private String status;
}