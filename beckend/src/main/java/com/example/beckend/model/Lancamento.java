package com.example.beckend.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "lancamentos")
public class Lancamento {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private LocalDate data;

	@Column(nullable = false, length = 100)
	private String categoria;

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal valor;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 10)
	private TipoLancamento tipo;

	@Column(nullable = false)
	private boolean pago;

	@Column(precision = 30, scale = 16)
	private BigDecimal grupoParcelamento;

	private Integer numeroParcela;

	private Integer totalParcelas;

	protected Lancamento() {
	}

	public Lancamento(LocalDate data, String categoria, BigDecimal valor, TipoLancamento tipo,
			boolean pago, BigDecimal grupoParcelamento, Integer numeroParcela, Integer totalParcelas) {
		this.data = data;
		this.categoria = categoria;
		this.valor = valor;
		this.tipo = tipo;
		this.pago = pago;
		this.grupoParcelamento = grupoParcelamento;
		this.numeroParcela = numeroParcela;
		this.totalParcelas = totalParcelas;
	}

	public void atualizar(LocalDate data, String categoria, BigDecimal valor, TipoLancamento tipo,
			boolean pago, BigDecimal grupoParcelamento, Integer numeroParcela, Integer totalParcelas) {
		this.data = data;
		this.categoria = categoria;
		this.valor = valor;
		this.tipo = tipo;
		this.pago = pago;
		this.grupoParcelamento = grupoParcelamento;
		this.numeroParcela = numeroParcela;
		this.totalParcelas = totalParcelas;
	}

	public void atualizarPagamento(boolean pago) {
		this.pago = pago;
	}

	public Long getId() {
		return id;
	}

	public LocalDate getData() {
		return data;
	}

	public String getCategoria() {
		return categoria;
	}

	public BigDecimal getValor() {
		return valor;
	}

	public TipoLancamento getTipo() {
		return tipo;
	}

	public boolean isPago() {
		return pago;
	}

	public BigDecimal getGrupoParcelamento() {
		return grupoParcelamento;
	}

	public Integer getNumeroParcela() {
		return numeroParcela;
	}

	public Integer getTotalParcelas() {
		return totalParcelas;
	}
}
