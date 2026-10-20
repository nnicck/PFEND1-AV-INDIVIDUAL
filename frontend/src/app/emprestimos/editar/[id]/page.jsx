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
                setErro("");

                const [resEmprestimo, resFuncionarios, resEquipamentos] =
                    await Promise.all([
                        fetch(`${API}/emprestimos/${id}`),
                        fetch(`${API}/funcionarios`),
                        fetch(`${API}/equipamentos`)
                    ]);

                if (
                    !resEmprestimo.ok ||
                    !resFuncionarios.ok ||
                    !resEquipamentos.ok
                ) {
                    throw new Error("Erro ao carregar os dados.");
                }

                const resultadoEmprestimo = await resEmprestimo.json();
                const resultadoFuncionarios = await resFuncionarios.json();
                const resultadoEquipamentos = await resEquipamentos.json();

                const dados = resultadoEmprestimo.dados;

                if (!dados) {
                    throw new Error("Empréstimo não encontrado.");
                }

                setEmprestimo({
                    data_emprestimo: dados.data_emprestimo
                        ? String(dados.data_emprestimo).slice(0, 10)
                        : "",
                    funcionario_id: String(dados.funcionario_id ?? ""),
                    equipamento_id: String(dados.equipamento_id ?? ""),
                    qtd_emprestimo: dados.qtd_emprestimo ?? "",
                    data_prevista_devolucao:
                        dados.data_prevista_devolucao
                            ? String(dados.data_prevista_devolucao).slice(0, 10)
                            : "",
                    status: dados.status ?? "Em andamento"
                });

                setFuncionarios(
                    resultadoFuncionarios.dados ?? []
                );

                setEquipamentos(
                    resultadoEquipamentos.dados ?? []
                );
            } catch (erro) {
                console.error(erro);
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
                const mensagem = await resposta.text();
                throw new Error(mensagem || "Erro ao atualizar empréstimo.");
            }

            router.push("/");
            router.refresh();
        } catch (erro) {
            console.error(erro);
            setErro(erro.message || "Não foi possível salvar as alterações.");
        } finally {
            setSalvando(false);
        }
    }

    if (erro && !emprestimo) {
        return (
            <main className="container py-5">
                <div className="alert alert-danger">{erro}</div>
                <Link href="/" className="btn btn-secondary">
                    Voltar
                </Link>
            </main>
        );
    }

    if (!emprestimo) {
        return (
            <main className="container py-5">
                Carregando empréstimo...
            </main>
        );
    }

    return (
        <main className="container py-5">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                    <h3 className="mb-0">
                        Editar empréstimo #{id}
                    </h3>
                    <small className="text-muted">
                        O código do empréstimo não pode ser alterado.
                    </small>
                </div>

                <div className="card-body p-4">
                    {erro && (
                        <div className="alert alert-danger">
                            {erro}
                        </div>
                    )}

                    <form onSubmit={salvarAlteracoes}>
                        <div className="mb-3">
                            <label className="form-label">
                                Data
                            </label>
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
                            <label className="form-label">
                                Funcionário
                            </label>
                            <select
                                name="funcionario_id"
                                className="form-select"
                                value={emprestimo.funcionario_id}
                                onChange={atualizarCampo}
                                required
                            >
                                <option value="">
                                    Selecione um funcionário
                                </option>

                                {funcionarios.map((funcionario) => (
                                    <option
                                        key={funcionario.id}
                                        value={String(funcionario.id)}
                                    >
                                        {funcionario.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Equipamento
                            </label>
                            <select
                                name="equipamento_id"
                                className="form-select"
                                value={emprestimo.equipamento_id}
                                onChange={atualizarCampo}
                                required
                            >
                                <option value="">
                                    Selecione um equipamento
                                </option>

                                {equipamentos.map((equipamento) => (
                                    <option
                                        key={equipamento.id}
                                        value={String(equipamento.id)}
                                    >
                                        {equipamento.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">
                                Quantidade
                            </label>
                            <input
                                type="number"
                                name="qtd_emprestimo"
                                className="form-control"
                                min="1"
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
                                value={emprestimo.data_prevista_devolucao}
                                onChange={atualizarCampo}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label">
                                Status
                            </label>
                            <select
                                name="status"
                                className="form-select"
                                value={emprestimo.status}
                                onChange={atualizarCampo}
                                required
                            >
                                <option value="Em andamento">
                                    Em andamento
                                </option>
                                <option value="Devolvido">
                                    Devolvido
                                </option>
                                <option value="Atrasado">
                                    Atrasado
                                </option>
                                <option value="Concluído">
                                    Concluído
                                </option>
                            </select>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <Link
                                href="/"
                                className="btn btn-outline-secondary"
                            >
                                Cancelar
                            </Link>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={salvando}
                            >
                                {salvando
                                    ? "Salvando..."
                                    : "Salvar alterações"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}