"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BarraNavegacao from "@/components/BarraNavegacao";
import TabelaFuncionarios from "@/components/TabelaFuncionarios";
import ModalConfirmacao from "@/components/ModalConfirmacao";

const API = "http://localhost:3001/api";

export default function Funcionarios() {
    const [funcionarios, setFuncionarios] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    // Controla o modal de confirmação da exclusão.
    const [modalAberto, setModalAberto] = useState(false);
    const [funcionarioSelecionado, setFuncionarioSelecionado] =
        useState(null);
    const [excluindo, setExcluindo] = useState(false);
    const [erroModal, setErroModal] = useState("");

    // Busca os funcionários cadastrados na API.
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

    // Filtra os funcionários pelo nome digitado.
    const funcionariosFiltrados = funcionarios.filter((funcionario) =>
        String(funcionario.nome ?? "")
            .toLowerCase()
            .includes(pesquisa.toLowerCase())
    );

    // Define a aparência do status de cada funcionário.
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

    // Abre o modal para confirmar a exclusão do funcionário selecionado.
    function abrirModal(funcionario) {
        setFuncionarioSelecionado(funcionario);
        setErroModal("");
        setModalAberto(true);
    }

    // Fecha o modal e limpa os dados da seleção.
    function fecharModal() {
        if (excluindo) return;

        setModalAberto(false);
        setFuncionarioSelecionado(null);
        setErroModal("");
    }

    // Exclui o funcionário após a confirmação no modal.
    async function excluirFuncionario() {
        if (!funcionarioSelecionado || excluindo) return;

        try {
            setExcluindo(true);
            setErroModal("");

            const resposta = await fetch(
                `${API}/funcionarios/${funcionarioSelecionado.id}`,
                {
                    method: "DELETE",
                }
            );

            if (!resposta.ok) {
                throw new Error(
                    "Não foi possível excluir o funcionário. Verifique se ele possui empréstimos registrados."
                );
            }

            // Atualiza a tabela sem precisar buscar os dados novamente.
            setFuncionarios((anteriores) =>
                anteriores.filter(
                    (funcionario) =>
                        String(funcionario.id) !==
                        String(funcionarioSelecionado.id)
                )
            );

            setModalAberto(false);
            setFuncionarioSelecionado(null);
        } catch (error) {
            console.error("Erro ao excluir funcionário:", error);
            setErroModal(error.message || "Erro ao excluir funcionário.");
        } finally {
            setExcluindo(false);
        }
    }

    return (
        <div className="d-flex min-vh-100 bg-light">
            <BarraNavegacao />

            <main className="flex-grow-1 p-4">
                {/* Cabeçalho da página */}
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

                {/* Pesquisa e botão para cadastrar funcionário */}
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
                                onChange={(evento) =>
                                    setPesquisa(evento.target.value)
                                }
                            />
                        </div>

                        <Link
                            href="/funcionarios/novo"
                            className="btn btn-primary"
                        >
                            + Registrar novo funcionário
                        </Link>
                    </div>
                </section>

                {/* Quantidade de funcionários encontrados */}
                <div className="mb-3 text-secondary">
                    Total de funcionários cadastrados:{" "}
                    <strong>{funcionariosFiltrados.length}</strong>
                </div>

                {/* Estados de carregamento e erro */}
                {carregando && (
                    <p className="text-secondary">
                        Carregando funcionários...
                    </p>
                )}

                {erro && (
                    <div className="alert alert-danger">{erro}</div>
                )}

                {/* Tabela reutilizável de funcionários */}
                {!carregando && !erro && (
                    <TabelaFuncionarios
                        funcionarios={funcionariosFiltrados}
                        obterStatus={obterStatus}
                        onExcluir={abrirModal}
                    />
                )}

                {/* Modal reutilizável para confirmar a exclusão */}
                <ModalConfirmacao
                    aberto={modalAberto}
                    titulo="Excluir funcionário"
                    mensagem={
                        funcionarioSelecionado
                            ? `Tem certeza de que deseja excluir o funcionário ${funcionarioSelecionado.nome}?`
                            : "Tem certeza de que deseja excluir este funcionário?"
                    }
                    erro={erroModal}
                    carregando={excluindo}
                    textoConfirmar="Excluir"
                    textoCancelar="Cancelar"
                    onConfirmar={excluirFuncionario}
                    onFechar={fecharModal}
                />
            </main>
        </div>
    );
}