"use client";

import { useEffect, useState } from "react";
import BarraNavegacao from "@/components/BarraNavegacao";
import Link from "next/link";

const API = "http://localhost:3001/api";

export default function Funcionarios() {
    const [funcionarios, setFuncionarios] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregarFuncionarios() {
            try {
                const resposta = await fetch(`${API}/funcionarios`);

                if (!resposta.ok) {
                    throw new Error("Erro ao buscar funcionários.");
                }

                const resultado = await resposta.json();

                setFuncionarios(
                    Array.isArray(resultado)
                        ? resultado
                        : resultado.dados ?? []
                );
            } catch (error) {
                console.error("Erro ao carregar funcionários:", error);
                setErro("Não foi possível carregar os funcionários.");
            } finally {
                setCarregando(false);
            }
        }

        carregarFuncionarios();
    }, []);

    const funcionariosFiltrados = funcionarios.filter((funcionario) =>
        String(funcionario.nome ?? "")
            .toLowerCase()
            .includes(pesquisa.toLowerCase())
    );

    async function excluirFuncionario(id) {
        const confirmar = window.confirm(
            "Tem certeza de que deseja excluir este funcionário?"
        );

        if (!confirmar) return;

        try {
            const resposta = await fetch(`${API}/funcionarios/${id}`, {
                method: "DELETE",
            });

            if (!resposta.ok) {
                throw new Error("Erro ao excluir funcionário.");
            }

            setFuncionarios((anteriores) =>
                anteriores.filter(
                    (funcionario) => funcionario.id !== id
                )
            );
        } catch (error) {
            console.error("Erro ao excluir funcionário:", error);

            alert(
                "Não foi possível excluir o funcionário. Verifique se ele possui empréstimos registrados."
            );
        }
    }

    function obterStatus(funcionario) {
        const status = String(
            funcionario.status_funcionarios ?? "Ativo"
        ).toLowerCase();

        if (status === "ativo") {
            return {
                texto: "Ativo",
                classe: "bg-success-subtle text-success",
            };
        }

        return {
            texto: funcionario.status_funcionarios ?? "Inativo",
            classe: "bg-danger-subtle text-danger",
        };
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
                            Funcionários
                        </h2>

                        <p className="text-secondary mb-0">
                            Gerencie os funcionários cadastrados no sistema.
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
                                Pesquisar funcionário
                            </label>

                            <input
                                id="pesquisa"
                                type="search"
                                className="form-control"
                                placeholder="Digite o nome do funcionário..."
                                value={pesquisa}
                                onChange={(e) =>
                                    setPesquisa(e.target.value)
                                }
                            />
                        </div>

                        <div className="text-secondary">
                            <Link
                                href="/funcionarios/novo"
                                className="btn btn-primary"
                            >
                                + Registrar novo funcionário
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="mb-3 text-secondary">
                    Total de funcionários cadastrados:{" "}
                    <strong>{funcionariosFiltrados.length}</strong>
                </div>

                {carregando && (
                    <p className="text-secondary">
                        Carregando funcionários...
                    </p>
                )}

                {erro && (
                    <div className="alert alert-danger">{erro}</div>
                )}

                {!carregando && !erro && (
                    <div className="table-responsive">
                        <table className="table align-middle">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nome</th>
                                    <th>Cargo</th>
                                    <th>Setor</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {funcionariosFiltrados.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center text-secondary py-4"
                                        >
                                            Nenhum funcionário encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    funcionariosFiltrados.map(
                                        (funcionario) => {
                                            const status =
                                                obterStatus(funcionario);

                                            return (
                                                <tr key={funcionario.id}>
                                                    <td className="fw-semibold text-primary">
                                                        {funcionario.id}
                                                    </td>

                                                    <td>
                                                        {funcionario.nome}
                                                    </td>

                                                    <td>
                                                        {funcionario.cargo || "-"}
                                                    </td>

                                                    <td>
                                                        {funcionario.setor || "-"}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`badge ${status.classe}`}
                                                        >
                                                            {status.texto}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <Link
                                                                href={`/funcionarios/editar/${funcionario.id}`}
                                                                className="btn btn-primary btn-sm"
                                                            >
                                                                Editar
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm"
                                                                onClick={() =>
                                                                    excluirFuncionario(
                                                                        funcionario.id
                                                                    )
                                                                }
                                                            >
                                                                Excluir
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}