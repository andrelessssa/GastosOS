package com.example.beckend.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.beckend.dto.LancamentoRequest;
import com.example.beckend.dto.LancamentoResponse;
import com.example.beckend.model.Lancamento;
import com.example.beckend.model.TipoLancamento;
import com.example.beckend.repository.LancamentoRepository;

@Service
@Transactional
public class LancamentoService {
	private final LancamentoRepository repository;

	public LancamentoService(LancamentoRepository repository) {
		this.repository = repository;
	}

	@Transactional(readOnly = true)
	public List<LancamentoResponse> listar(TipoLancamento tipo) {
		List<Lancamento> lancamentos = repository.findByTipoOrderByDataDesc(tipo);
		return lancamentos.stream().map(LancamentoResponse::de).toList();
	}

	@Transactional(readOnly = true)
	public LancamentoResponse buscar(Long id, TipoLancamento tipo) {
		return LancamentoResponse.de(buscarEntidade(id, tipo));
	}

	public LancamentoResponse criar(LancamentoRequest request, TipoLancamento tipo) {
		validarParcelamento(request, tipo);
		Lancamento lancamento = new Lancamento(
				request.date(),
				request.cat().trim(),
				request.val(),
				tipo,
				pagoInicial(request, tipo),
				request.grupo(),
				request.parc(),
				request.total());
		return LancamentoResponse.de(repository.save(lancamento));
	}

	public LancamentoResponse atualizar(Long id, LancamentoRequest request, TipoLancamento tipo) {
		validarParcelamento(request, tipo);
		Lancamento lancamento = buscarEntidade(id, tipo);
		lancamento.atualizar(
				request.date(),
				request.cat().trim(),
				request.val(),
				tipo,
				pagoInicial(request, tipo),
				request.grupo(),
				request.parc(),
				request.total());
		return LancamentoResponse.de(repository.save(lancamento));
	}

	public LancamentoResponse atualizarPagamento(Long id, boolean paga) {
		Lancamento lancamento = buscarEntidade(id, TipoLancamento.GASTO);
		lancamento.atualizarPagamento(paga);
		return LancamentoResponse.de(repository.save(lancamento));
	}

	public void excluir(Long id, TipoLancamento tipo) {
		Lancamento lancamento = buscarEntidade(id, tipo);
		BigDecimal grupo = lancamento.getGrupoParcelamento();
		Integer parcela = lancamento.getNumeroParcela();
		if (grupo != null && parcela != null) {
			repository.deleteAll(repository.findByTipoAndGrupoParcelamentoAndNumeroParcelaGreaterThan(
					tipo, grupo, parcela));
		}
		repository.delete(lancamento);
	}

	private boolean pagoInicial(LancamentoRequest request, TipoLancamento tipo) {
		return tipo == TipoLancamento.ENTRADA || request.paga() == null || request.paga();
	}

	private Lancamento buscarEntidade(Long id, TipoLancamento tipo) {
		Lancamento lancamento = repository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lançamento não encontrado"));
		if (lancamento.getTipo() != tipo) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Lançamento não encontrado");
		}
		return lancamento;
	}

	private void validarParcelamento(LancamentoRequest request, TipoLancamento tipo) {
		boolean informado = request.grupo() != null || request.parc() != null || request.total() != null;
		if (!informado) {
			return;
		}
		boolean valido = tipo == TipoLancamento.GASTO
				&& request.grupo() != null
				&& request.grupo().compareTo(BigDecimal.ZERO) > 0
				&& request.parc() != null
				&& request.total() != null
				&& request.total() > 1
				&& request.parc() <= request.total();
		if (!valido) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados de parcelamento inválidos");
		}
	}
}
