"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API = "http://localhost:3001/api";

export default function EditarEmprestimo() {
    const { id } = useParams();
    const router = useRouter();

    const [emprestimo, setEmprestimo] = useState(null);
    const [funcionarios, setFuncionarios] = useState([]);
    const [equipamentos, setEquipamentos] = useState([]);
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        async function carregarDados() {
            try {
                const respostas = await Promise.all([
                    fetch(`${API}/emprestimos/${id}`),
                    fetch(`${API}/funcionarios`),
                    fetch(`${API}/equipamentos`)
                ]);

                if (respostas.some((resposta) => !resposta.ok)) {
                    throw new Error("Erro ao carregar os dados.");
                }

                const [rEmprestimo, rFuncionarios, rEquipamentos] =
                    await Promise.all(respostas.map((r) => r.json()));

                const dados = rEmprestimo.dados;

                if (!dados) {
                    throw new Error("Empréstimo não encontrado.");
                }

                setEmprestimo({
                    data_emprestimo: String(dados.data_emprestimo ?? "").slice(0, 10),
                    funcionario_id: String(dados.funcionario_id ?? ""),
                    equipamento_id: String(dados.equipamento_id ?? ""),
                    qtd_emprestimo: dados.qtd_emprestimo ?? "",
                    data_prevista_devolucao: String(
                        dados.data_prevista_devolucao ?? ""
                    ).slice(0, 10),
                    status: dados.status ?? "Em andamento"
                });

                setFuncionarios(rFuncionarios.dados ?? []);
                setEquipamentos(rEquipamentos.dados ?? []);
            } catch (erro) {
                setErro(erro.message || "Não foi possível carregar os dados.");
            }
        }

        carregarDados();
    }, [id]);

    function atualizarCampo(evento) {
        const { name, value } = evento.target;

        setEmprestimo((anterior) => ({
            ...anterior,
            [name]: value
        }));
    }

    async function salvarAlteracoes(evento) {
        evento.preventDefault();
        setErro("");

        if (
            emprestimo.data_prevista_devolucao <
            emprestimo.data_emprestimo
        ) {
            setErro("A data de devolução não pode ser anterior à data do empréstimo.");
            return;
        }

        if (
            !Number.isInteger(Number(emprestimo.qtd_emprestimo)) ||
            Number(emprestimo.qtd_emprestimo) < 1
        ) {
            setErro("Informe uma quantidade inteira maior que zero.");
            return;
        }

        setSalvando(true);

        try {
            const resposta = await fetch(`${API}/emprestimos/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    data_emprestimo: emprestimo.data_emprestimo,
                    funcionario_id: Number(emprestimo.funcionario_id),
                    equipamento_id: Number(emprestimo.equipamento_id),
                    qtd_emprestimo: Number(emprestimo.qtd_emprestimo),
                    data_prevista_devolucao:
                        emprestimo.data_prevista_devolucao,
                    status: emprestimo.status
                })
            });

            if (!resposta.ok) {
                const resultado = await resposta.json().catch(() => ({}));
                throw new Error(
                    resultado.mensagem ||
                    resultado.erro ||
                    "Erro ao atualizar empréstimo."
                );
            }

            router.push("/");
            router.refresh();
        } catch (erro) {
            setErro(erro.message || "Não foi possível salvar as alterações.");
        } finally {
            setSalvando(false);
        }
    }

    if (!emprestimo) {
        return (
            <main className="container py-5">
                {erro ? (
                    <>
                        <div className="alert alert-danger">{erro}</div>
                        <Link href="/" className="btn btn-secondary">
                            Voltar
                        </Link>
                    </>
                ) : (
                    <p>Carregando empréstimo...</p>
                )}
            </main>
        );
    }

    return (
        <main className="container py-5">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                    <h3 className="mb-0">Editar empréstimo #{id}</h3>
                    <small className="text-muted">
                        O código do empréstimo não pode ser alterado.
                    </small>
                </div>

                <div className="card-body p-4">
                    {erro && (
                        <div className="alert alert-danger">{erro}</div>
                    )}

                    <form onSubmit={salvarAlteracoes}>
                        <div className="mb-3">
                            <label className="form-label">Data do empréstimo</label>
                            <input
                                type="date"
                                name="data_emprestimo"
                                className="form-control"
                                value={emprestimo.data_emprestimo}
                                onChange={atualizarCampo}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Funcionário</label>
                            <select
                                name="funcionario_id"
                                className="form-select"
                                value={emprestimo.funcionario_id}
                                onChange={atualizarCampo}
                                required
                            >
                                <option value="">Selecione um funcionário</option>
                                {funcionarios.map((funcionario) => (
                                    <option key={funcionario.id} value={funcionario.id}>
                                        {funcionario.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Equipamento</label>
                            <select
                                name="equipamento_id"
                                className="form-select"
                                value={emprestimo.equipamento_id}
                                onChange={atualizarCampo}
                                required
                            >
                                <option value="">Selecione um equipamento</option>
                                {equipamentos.map((equipamento) => (
                                    <option key={equipamento.id} value={equipamento.id}>
                                        {equipamento.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Quantidade</label>
                            <input
                                type="number"
                                name="qtd_emprestimo"
                                className="form-control"
                                min="1"
                                step="1"
                                value={emprestimo.qtd_emprestimo}
                                onChange={atualizarCampo}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Devolução prevista
                            </label>
                            <input
                                type="date"
                                name="data_prevista_devolucao"
                                className="form-control"
                                min={emprestimo.data_emprestimo}
                                value={emprestimo.data_prevista_devolucao}
                                onChange={atualizarCampo}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label">Status</label>
                            <select
                                name="status"
                                className="form-select"
                                value={emprestimo.status}
                                onChange={atualizarCampo}
                                required
                            >
                                <option value="Em andamento">Em andamento</option>
                                <option value="Devolvido">Devolvido</option>
                                <option value="Atrasado">Atrasado</option>
                            </select>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <Link href="/" className="btn btn-outline-secondary">
                                Cancelar
                            </Link>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={salvando}
                            >
                                {salvando ? "Salvando..." : "Salvar alterações"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}