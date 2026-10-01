package com.example.beckend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.beckend.dto.LancamentoRequest;
import com.example.beckend.dto.LancamentoResponse;
import com.example.beckend.dto.StatusPagamentoRequest;
import com.example.beckend.model.TipoLancamento;
import com.example.beckend.service.LancamentoService;

import jakarta.validation.Valid;

@RestController
public class LancamentoController {
	private final LancamentoService service;

	public LancamentoController(LancamentoService service) {
		this.service = service;
	}

	@GetMapping("/api/gastos")
	public List<LancamentoResponse> listarGastos() {
		return service.listar(TipoLancamento.GASTO);
	}

	@GetMapping("/api/entradas")
	public List<LancamentoResponse> listarEntradas() {
		return service.listar(TipoLancamento.ENTRADA);
	}

	@GetMapping("/api/gastos/{id}")
	public LancamentoResponse buscarGasto(@PathVariable Long id) {
		return service.buscar(id, TipoLancamento.GASTO);
	}

	@GetMapping("/api/entradas/{id}")
	public LancamentoResponse buscarEntrada(@PathVariable Long id) {
		return service.buscar(id, TipoLancamento.ENTRADA);
	}

	@PostMapping("/api/gastos")
	public ResponseEntity<LancamentoResponse> criarGasto(@Valid @RequestBody LancamentoRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request, TipoLancamento.GASTO));
	}

	@PostMapping("/api/entradas")
	public ResponseEntity<LancamentoResponse> criarEntrada(@Valid @RequestBody LancamentoRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(request, TipoLancamento.ENTRADA));
	}

	@PutMapping("/api/gastos/{id}")
	public LancamentoResponse atualizarGasto(@PathVariable Long id, @Valid @RequestBody LancamentoRequest request) {
		return service.atualizar(id, request, TipoLancamento.GASTO);
	}

	@PutMapping("/api/entradas/{id}")
	public LancamentoResponse atualizarEntrada(@PathVariable Long id, @Valid @RequestBody LancamentoRequest request) {
		return service.atualizar(id, request, TipoLancamento.ENTRADA);
	}

	@PatchMapping("/api/gastos/{id}/pagamento")
	public LancamentoResponse atualizarPagamento(@PathVariable Long id,
			@Valid @RequestBody StatusPagamentoRequest request) {
		return service.atualizarPagamento(id, request.paga());
	}

	@DeleteMapping("/api/gastos/{id}")
	public ResponseEntity<Void> excluirGasto(@PathVariable Long id) {
		service.excluir(id, TipoLancamento.GASTO);
		return ResponseEntity.noContent().build();
	}

	@DeleteMapping("/api/entradas/{id}")
	public ResponseEntity<Void> excluirEntrada(@PathVariable Long id) {
		service.excluir(id, TipoLancamento.ENTRADA);
		return ResponseEntity.noContent().build();
	}
}
