"use client";

import { useEffect, useState } from "react";
import BarraNavegacao from "@/components/BarraNavegacao";
import Link from "next/link";

const API = "http://localhost:3001/api";

export default function Equipamentos() {
    const [equipamentos, setEquipamentos] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregarEquipamentos() {
            try {
                const resposta = await fetch(`${API}/equipamentos`);

                if (!resposta.ok) {
                    throw new Error("Erro ao buscar equipamentos.");
                }

                const resultado = await resposta.json();

                setEquipamentos(
                    Array.isArray(resultado)
                        ? resultado
                        : resultado.dados ?? []
                );
            } catch (error) {
                console.error("Erro ao carregar equipamentos:", error);
                setErro("Não foi possível carregar os equipamentos.");
            } finally {
                setCarregando(false);
            }
        }

        carregarEquipamentos();
    }, []);

    const equipamentosFiltrados = equipamentos.filter((equipamento) =>
        String(equipamento.nome ?? "")
            .toLowerCase()
            .includes(pesquisa.toLowerCase())
    );

    async function excluirEquipamento(id) {
        const confirmar = window.confirm(
            "Tem certeza de que deseja excluir este equipamento?"
        );

        if (!confirmar) return;

        try {
            const resposta = await fetch(`${API}/equipamentos/${id}`, {
                method: "DELETE",
            });

            if (!resposta.ok) {
                throw new Error("Erro ao excluir equipamento.");
            }

            setEquipamentos((anteriores) =>
                anteriores.filter((equipamento) => equipamento.id !== id)
            );
        } catch (error) {
            console.error(error);
            alert("Não foi possível excluir o equipamento.");
        }
    }

    function obterStatus(equipamento) {
        const total = Number(equipamento.maximo_equipamentos ?? 0);
        const disponivel = Number(equipamento.qtd_disponivel ?? 0);

        if (disponivel <= 0) {
            return {
                texto: "Indisponível",
                classe: "bg-danger-subtle text-danger",
            };
        }

        if (disponivel < total) {
            return {
                texto: "Em uso",
                classe: "bg-warning-subtle text-warning-emphasis",
            };
        }

        return {
            texto: "Disponível",
            classe: "bg-success-subtle text-success",
        };
    }

    return (
        <div className="d-flex min-vh-100 bg-light">
            <BarraNavegacao />

            <main className="flex-grow-1 p-4">
                <header className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                    <div>
                        <h2 className="fw-bold mb-1" style={{ color: "#142D52" }}>
                            Equipamentos EPI
                        </h2>

                        <p className="text-secondary mb-0">
                            Gerencie os equipamentos de proteção individual cadastrados.
                        </p>
                    </div>
                </header>

                <section className="card border-0 shadow-sm mb-4">
                    <div className="card-body d-flex justify-content-between align-items-end flex-wrap gap-3">
                        <div className="flex-grow-1" style={{ maxWidth: "550px" }}>
                            <label htmlFor="pesquisa" className="form-label fw-semibold">
                                Pesquisar equipamento
                            </label>

                            <input
                                id="pesquisa"
                                type="search"
                                className="form-control"
                                placeholder="Digite o nome do equipamento..."
                                value={pesquisa}
                                onChange={(e) => setPesquisa(e.target.value)}
                            />
                        </div>

                        <div className="text-secondary">
                            <Link href="/equipamentos/novo" className="btn btn-primary">
                                + Registrar novo equipamento
                            </Link>
                        </div>
                    </div>
                </section>

                <div className="mb-3 text-secondary">
                    Total de equipamentos cadastrados:{" "}
                    <strong>{equipamentosFiltrados.length}</strong>
                </div>

                {carregando && (
                    <p className="text-secondary">Carregando equipamentos...</p>
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
                                    <th>Tipo</th>
                                    <th>Qtd. de equipamentos</th>
                                    <th>Qtd. disponível</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>

                            <tbody>
                                {equipamentosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center text-secondary py-4">
                                            Nenhum equipamento encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    equipamentosFiltrados.map((equipamento) => {
                                        const status = obterStatus(equipamento);

                                        return (
                                            <tr key={equipamento.id}>
                                                <th scope="row" className="text-primary">
                                                    {equipamento.id}
                                                </th>

                                                <td>{equipamento.nome}</td>
                                                <td>{equipamento.categoria}</td>
                                                <td>{equipamento.maximo_equipamentos}</td>
                                                <td>{equipamento.qtd_disponivel}</td>

                                                <td>
                                                    <span className={`badge ${status.classe}`}>
                                                        {status.texto}
                                                    </span>
                                                </td>

                                                <td>
                                                    <div className="d-flex gap-2">
                                                        <Link
                                                            href={`/equipamentos/editar/${equipamento.id}`}
                                                            className="btn btn-primary btn-sm"
                                                        >
                                                            Editar
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => excluirEquipamento(equipamento.id)}
                                                        >
                                                            Excluir
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}