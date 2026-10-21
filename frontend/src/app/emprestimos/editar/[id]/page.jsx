"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import BarraNavegacao from "@/components/BarraNavegacao";

const API = "http://localhost:3001/api";

export default function EditarEmprestimo() {
const params = useParams();
const router = useRouter();
const id = params.id;

const [emprestimo, setEmprestimo] = useState(null);
const [funcionarios, setFuncionarios] = useState([]);
const [equipamentos, setEquipamentos] = useState([]);
const [erro, setErro] = useState("");
const [carregando, setCarregando] = useState(true);
const [salvando, setSalvando] = useState(false);

useEffect(() => {
    async function carregarDados() {
        try {
            setCarregando(true);
            setErro("");

            const respostas = await Promise.all([
                fetch(`${API}/emprestimos/${id}`),
                fetch(`${API}/funcionarios`),
                fetch(`${API}/equipamentos`)
            ]);

            if (respostas.some((resposta) => !resposta.ok)) {
                throw new Error("Erro ao carregar os dados.");
            }

            const [
                rEmprestimo,
                rFuncionarios,
                rEquipamentos
            ] = await Promise.all(
                respostas.map((resposta) => resposta.json())
            );

            const dados = rEmprestimo.dados ?? rEmprestimo;

            if (!dados || dados.emprestimo_id == null && dados.id == null) {
                throw new Error("Empréstimo não encontrado.");
            }

            setEmprestimo({
                data_emprestimo: String(
                    dados.data_emprestimo ?? ""
                ).slice(0, 10),

                funcionario_id: String(
                    dados.funcionario_id ?? ""
                ),

                equipamento_id: String(
                    dados.equipamento_id ?? ""
                ),

                qtd_emprestimo: dados.qtd_emprestimo ?? "",

                data_prevista_devolucao: String(
                    dados.data_prevista_devolucao ?? ""
                ).slice(0, 10),

                status: dados.status_atual ??
                    dados.status ??
                    "Em andamento"
            });

            setFuncionarios(rFuncionarios.dados ?? rFuncionarios);
            setEquipamentos(rEquipamentos.dados ?? rEquipamentos);
        } catch (erro) {
            console.error("Erro ao carregar dados:", erro);
            setErro(
                erro.message || "Não foi possível carregar os dados."
            );
        } finally {
            setCarregando(false);
        }
    }

    if (id) {
        carregarDados();
    }
}, [id]);

function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setEmprestimo((anterior) => ({
        ...anterior,
        [name]: value
    }));

    setErro("");
}

async function salvarAlteracoes(evento) {
    evento.preventDefault();
    setErro("");

    if (
        !emprestimo.data_emprestimo ||
        !emprestimo.funcionario_id ||
        !emprestimo.equipamento_id ||
        !emprestimo.data_prevista_devolucao ||
        !emprestimo.status
    ) {
        setErro("Preencha todos os campos.");
        return;
    }

    if (
        emprestimo.data_prevista_devolucao <
        emprestimo.data_emprestimo
    ) {
        setErro(
            "A data de devolução não pode ser anterior à data do empréstimo."
        );
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

        const resultado = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(
                resultado.mensagem ||
                resultado.erro ||
                "Erro ao atualizar empréstimo."
            );
        }

        router.push("/");
        router.refresh();
    } catch (erro) {
        console.error("Erro ao atualizar empréstimo:", erro);
        setErro(
            erro.message || "Não foi possível salvar as alterações."
        );
    } finally {
        setSalvando(false);
    }
}

return (
    <div className="d-flex min-vh-100 bg-light">
        <BarraNavegacao />

        <main className="flex-grow-1 p-4">
            <div className="mb-4">
                <h2 className="fw-bold mt-3 mb-1 text-black">
                    Editar empréstimo
                </h2>

                <p className="text-secondary">
                    Atualize os dados do empréstimo cadastrado.
                </p>
            </div>

            {carregando ? (
                <p className="text-secondary">
                    Carregando empréstimo...
                </p>
            ) : !emprestimo ? (
                <div>
                    <div className="alert alert-danger">
                        {erro || "Empréstimo não encontrado."}
                    </div>

                    <Link
                        href="/"
                        className="btn btn-outline-secondary"
                    >
                        Voltar
                    </Link>
                </div>
            ) : (
                <section className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                        <div className="mb-4">
                            <h5 className="fw-semibold mb-1">
                                Dados do empréstimo
                            </h5>

                            <p className="text-secondary small mb-0">
                                Código do empréstimo: #{id}
                            </p>
                        </div>

                        <form onSubmit={salvarAlteracoes}>
                            <div className="row g-3">
                                <div className="col-md-6">
                                    <label
                                        htmlFor="data_emprestimo"
                                        className="form-label fw-semibold"
                                    >
                                        Data do empréstimo
                                    </label>

                                    <input
                                        id="data_emprestimo"
                                        type="date"
                                        name="data_emprestimo"
                                        className="form-control"
                                        value={emprestimo.data_emprestimo}
                                        onChange={atualizarCampo}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label
                                        htmlFor="data_prevista_devolucao"
                                        className="form-label fw-semibold"
                                    >
                                        Devolução prevista
                                    </label>

                                    <input
                                        id="data_prevista_devolucao"
                                        type="date"
                                        name="data_prevista_devolucao"
                                        className="form-control"
                                        min={emprestimo.data_emprestimo}
                                        value={
                                            emprestimo.data_prevista_devolucao
                                        }
                                        onChange={atualizarCampo}
                                        required
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label
                                        htmlFor="funcionario_id"
                                        className="form-label fw-semibold"
                                    >
                                        Funcionário
                                    </label>

                                    <select
                                        id="funcionario_id"
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
                                                value={funcionario.id}
                                            >
                                                {funcionario.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label
                                        htmlFor="equipamento_id"
                                        className="form-label fw-semibold"
                                    >
                                        Equipamento
                                    </label>

                                    <select
                                        id="equipamento_id"
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
                                                value={equipamento.id}
                                            >
                                                {equipamento.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="col-md-6">
                                    <label
                                        htmlFor="qtd_emprestimo"
                                        className="form-label fw-semibold"
                                    >
                                        Quantidade
                                    </label>

                                    <input
                                        id="qtd_emprestimo"
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

                                <div className="col-md-6">
                                    <label
                                        htmlFor="status"
                                        className="form-label fw-semibold"
                                    >
                                        Status
                                    </label>

                                    <select
                                        id="status"
                                        name="status"
                                        className="form-select"
                                        value={emprestimo.status}
                                        onChange={atualizarCampo}
                                        required
                                    >
                                        <option value="Em andamento">
                                            Em andamento
                                        </option>

                                        <option value="Atrasado">
                                            Atrasado
                                        </option>
                                    </select>
                                </div>
                            </div>

                            {erro && (
                                <div className="alert alert-danger mt-4 mb-0">
                                    {erro}
                                </div>
                            )}

                            <div className="d-flex justify-content-end gap-2 mt-4">
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
                </section>
            )}
        </main>
    </div>
);

}