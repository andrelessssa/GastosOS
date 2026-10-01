package com.example.beckend.dto;

import jakarta.validation.constraints.NotNull;

public record StatusPagamentoRequest(@NotNull Boolean paga) {
}
