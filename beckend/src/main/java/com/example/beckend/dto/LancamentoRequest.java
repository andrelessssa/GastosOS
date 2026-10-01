package com.example.beckend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record LancamentoRequest(
		@NotNull LocalDate date,
		@NotBlank @Size(max = 100) String cat,
		@NotNull @DecimalMin("0.01") BigDecimal val,
		Boolean paga,
		@Positive BigDecimal grupo,
		@Positive Integer parc,
		@Positive Integer total) {
}
