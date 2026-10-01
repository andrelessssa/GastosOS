package com.example.beckend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.example.beckend.model.Lancamento;
import com.example.beckend.model.TipoLancamento;

public record LancamentoResponse(
		Long id,
		LocalDate date,
		String cat,
		BigDecimal val,
		Boolean paga,
		BigDecimal grupo,
		Integer parc,
		Integer total) {

	public static LancamentoResponse de(Lancamento lancamento) {
		return new LancamentoResponse(
				lancamento.getId(),
				lancamento.getData(),
				lancamento.getCategoria(),
				lancamento.getValor(),
				lancamento.getTipo() == TipoLancamento.GASTO ? lancamento.isPago() : null,
				lancamento.getGrupoParcelamento(),
				lancamento.getNumeroParcela(),
				lancamento.getTotalParcelas());
	}
}
