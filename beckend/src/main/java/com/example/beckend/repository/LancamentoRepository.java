package com.example.beckend.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.beckend.model.Lancamento;
import com.example.beckend.model.TipoLancamento;

public interface LancamentoRepository extends JpaRepository<Lancamento, Long> {

	List<Lancamento> findByTipoOrderByDataDesc(TipoLancamento tipo);

	List<Lancamento> findByTipoAndGrupoParcelamentoAndNumeroParcelaGreaterThan(
			TipoLancamento tipo, BigDecimal grupoParcelamento, Integer numeroParcela);
}
