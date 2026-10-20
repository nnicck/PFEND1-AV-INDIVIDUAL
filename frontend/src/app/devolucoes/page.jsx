"use client";

import { useEffect, useState } from "react";
import BarraNavegacao from "@/components/BarraNavegacao";
import Link from "next/link";

const API = "http://localhost:3001/api";

export default function Devolucoes() {
    const [devolucoes, setDevolucoes] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregarDevolucoes() {
            try {
                setCarregando(true);
                setErro("");

                const resposta = await fetch(`${API}/devolucoes`);

                if (!resposta.ok) {
                    throw new Error("Erro ao buscar devoluções.");
                }

                const resultado = await resposta.json();

                const lista = Array.isArray(resultado)
                    ? resultado
                    : resultado.dados ?? resultado.data ?? [];

                setDevolucoes(lista);
            } catch (error) {
                console.error("Erro ao carregar devoluções:", error);
                setErro("Não foi possível carregar as devoluções.");
            } finally {
                setCarregando(false);
            }
        }

        carregarDevolucoes();
    }, []);

    function formatarData(data) {
        if (!data) return "-";

        const partes = String(data).slice(0, 10).split("-");

        if (partes.length !== 3) return String(data);

        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    const termo = pesquisa.trim().toLowerCase();

    const devolucoesFiltradas = devolucoes.filter((devolucao) => {
        return (
            String(devolucao.emprestimo_id ?? "")
                .toLowerCase()
                .includes(termo) ||
            String(
                devolucao.funcionario_nome ??
                devolucao.funcionario ??
                ""
            )
                .toLowerCase()
                .includes(termo) ||
            String(
                devolucao.equipamento_nome ??
                devolucao.equipamento ??
                ""
            )
                .toLowerCase()
                .includes(termo)
        );
    });

    async function excluirDevolucao(id) {
        const confirmar = window.confirm(
            "Tem certeza de que deseja excluir esta devolução?"
        );

        if (!confirmar) return;

        try {
            const resposta = await fetch(`${API}/devolucoes/${id}`, {
                method: "DELETE",
            });

            if (!resposta.ok) {
                const resultado = await resposta.json().catch(() => ({}));

                throw new Error(
                    resultado.mensagem ||
                    resultado.erro ||
                    "Erro ao excluir devolução."
                );
            }

            setDevolucoes((anteriores) =>
                anteriores.filter(
                    (devolucao) => Number(devolucao.id) !== Number(id)
                )
            );
        } catch (error) {
            console.error("Erro ao excluir devolução:", error);

            alert(
                error.message ||
                "Não foi possível excluir a devolução. Verifique a API e as regras de estoque."
            );
        }
    }

    return (
        <div className="d-flex min-vh-100 bg-light">
            <BarraNavegacao />

            <main className="flex-grow-1 p-4">
                <header className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <div>
                        <h2
                            className="fw-bold mb-1"
                            style={{ color: "#142D52" }}
                        >
                            Devoluções
                        </h2>

                        <p className="text-secondary mb-0">
                            Consulte e gerencie as devoluções de equipamentos.
                        </p>
                    </div>
                </header>

                <section className="card border-0 shadow-sm mb-4">
                    <div className="card-body d-flex justify-content-between align-items-end flex-wrap gap-3">
                        <div
                            className="flex-grow-1"
                            style={{ maxWidth: "550px" }}
                        >
                            <label
                                htmlFor="pesquisa"
                                className="form-label fw-semibold"
                            >
                                Pesquisar devolução
                            </label>

                            <input
                                id="pesquisa"
                                type="search"
                                className="form-control"
                                placeholder="Funcionário ou equipamento..."
                                value={pesquisa}
                                onChange={(e) =>
                                    setPesquisa(e.target.value)
                                }
                            />
                        </div>

                        <Link
                            href="/devolucoes/novo"
                            className="btn btn-primary"
                        >
                            + Registrar devolução
                        </Link>
                    </div>
                </section>

                <div className="mb-3 text-secondary">
                    Total de devoluções encontradas:{" "}
                    <strong>{devolucoesFiltradas.length}</strong>
                </div>

                {carregando && (
                    <p className="text-secondary">
                        Carregando devoluções...
                    </p>
                )}

                {erro && (
                    <div className="alert alert-danger" role="alert">
                        {erro}
                    </div>
                )}

                {!carregando && !erro && (
                    <div className="table-responsive">
                        <table className="table align-middle">
                            <thead>
                                <tr>
                                    <th>Empréstimo</th>
                                    <th>Funcionário</th>
                                    <th>Equipamento</th>
                                    <th>Data da devolução</th>
                                    <th>Quantidade devolvida</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {devolucoesFiltradas.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center text-secondary py-4"
                                        >
                                            Nenhuma devolução encontrada.
                                        </td>
                                    </tr>
                                ) : (
                                    devolucoesFiltradas.map((devolucao) => (
                                        <tr key={devolucao.id}>
                                            <td>
                                                {devolucao.emprestimo_id ?? "-"}
                                            </td>

                                            <td>
                                                {devolucao.funcionario_nome ??
                                                    devolucao.funcionario ??
                                                    "-"}
                                            </td>

                                            <td>
                                                {devolucao.equipamento_nome ??
                                                    devolucao.equipamento ??
                                                    "-"}
                                            </td>

                                            <td>
                                                {formatarData(
                                                    devolucao.data_devolucao
                                                )}
                                            </td>

                                            <td>
                                                {devolucao.quantidade_devolvida ?? "-"}
                                            </td>

                                            <td>
                                                <div className="d-flex gap-2">
                                                    <Link
                                                        href={`/devolucoes/editar/${devolucao.id}`}
                                                        className="btn btn-primary btn-sm"
                                                    >
                                                        Editar
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() =>
                                                            excluirDevolucao(
                                                                devolucao.id
                                                            )
                                                        }
                                                    >
                                                        Excluir
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}