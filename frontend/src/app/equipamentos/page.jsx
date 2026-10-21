"use client";

import { useEffect, useState } from "react";
import BarraNavegacao from "@/components/BarraNavegacao";
import ModalConfirmacao from "@/components/ModalConfirmacao";
import TabelaEquipamentos from "@/components/TabelaEquipamentos";
import Link from "next/link";

const API = "http://localhost:3001/api";

export default function Equipamentos() {
    const [equipamentos, setEquipamentos] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");

    // Estados do modal de exclusão.
    const [modalAberto, setModalAberto] = useState(false);
    const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
    const [erroExclusao, setErroExclusao] = useState("");
    const [excluindo, setExcluindo] = useState(false);

    // Busca os equipamentos cadastrados.
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

    // Filtra pelo nome e ordena os IDs do menor para o maior.
    const equipamentosFiltrados = equipamentos
        .filter((equipamento) =>
            String(equipamento.nome ?? "")
                .toLowerCase()
                .includes(pesquisa.toLowerCase())
        )
        .sort((a, b) => Number(a.id) - Number(b.id));

    // Abre o modal para o equipamento selecionado.
    function abrirModal(equipamento) {
        setEquipamentoSelecionado(equipamento);
        setErroExclusao("");
        setModalAberto(true);
    }

    // Fecha o modal e limpa os estados temporários.
    function fecharModal() {
        if (excluindo) return;

        setModalAberto(false);
        setEquipamentoSelecionado(null);
        setErroExclusao("");
    }

    // Exclui o equipamento selecionado pela API.
    async function excluirEquipamento() {
        if (!equipamentoSelecionado || excluindo) return;

        try {
            setExcluindo(true);
            setErroExclusao("");

            const resposta = await fetch(
                `${API}/equipamentos/${equipamentoSelecionado.id}`,
                { method: "DELETE" }
            );

            // Tenta ler a resposta enviada pelo backend.
            const resultado = await resposta.json().catch(() => ({}));

            // Trata os erros retornados pela API.
            if (!resposta.ok) {
                throw new Error(
                    resultado.message ||
                    "Não é possível excluir este equipamento porque existem empréstimos vinculados a ele."
                );
            }

            // Atualiza a tabela somente após a exclusão bem-sucedida.
            setEquipamentos((anteriores) => anteriores.filter( (equipamento) => Number(equipamento.id) !==  Number(equipamentoSelecionado.id))
            );

            setModalAberto(false);
            setEquipamentoSelecionado(null);
        } catch (error) {
            console.error("Erro ao excluir equipamento:", error);
            setErroExclusao(
                error.message || "Ocorreu um erro ao excluir o equipamento."
            );
        } finally {
            setExcluindo(false);
        }
    }

    // Calcula o status com base nas quantidades total e disponível.
    function obterStatus(equipamento) {
        const total = Number(
            equipamento.maximo_equipamentos ?? 0
        );
        const disponivel = Number(
            equipamento.qtd_disponivel ?? 0
        );

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
                        <h2
                            className="fw-bold mb-1"
                            style={{ color: "#142D52" }}
                        >
                            Equipamentos EPI
                        </h2>

                        <p className="text-secondary mb-0">
                            Gerencie os equipamentos de proteção individual cadastrados.
                        </p>
                    </div>
                </header>

                {/* Pesquisa e cadastro de equipamentos. */}
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
                                Pesquisar equipamento
                            </label>

                            <input
                                id="pesquisa"
                                type="search"
                                className="form-control"
                                placeholder="Digite o nome do equipamento..."
                                value={pesquisa}
                                onChange={(e) =>
                                    setPesquisa(e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <Link href="/equipamentos/novo" className="btn btn-primary">
                                + Registrar novo equipamento
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Quantidade de equipamentos exibidos. */}
                <div className="mb-3 text-secondary">
                    Total de equipamentos cadastrados:{" "}
                    <strong>{equipamentosFiltrados.length}</strong>
                </div>

                {carregando && (
                    <p className="text-secondary">
                        Carregando equipamentos...
                    </p>
                )}

                {erro && (
                    <div className="alert alert-danger">
                        {erro}
                    </div>
                )}

                {/* Tabela de equipamentos. */}
                
                {/* Exibe a tabela de equipamentos usando o componente reutilizável. */}
                {!carregando && !erro && (
                    <TabelaEquipamentos
                        equipamentos={equipamentosFiltrados}
                        obterStatus={obterStatus}
                        onExcluir={abrirModal}
                    />
                )}
            </main>

            {/* Modal reutilizável para confirmar ou cancelar a exclusão. */}
            <ModalConfirmacao
                aberto={modalAberto}
                titulo={ erroExclusao ? "Não foi possível excluir" : "Confirmar exclusão"}
                mensagem={
                    <p className="mb-0">
                        Tem certeza de que deseja excluir o equipamento{" "}
                        <strong>
                            {equipamentoSelecionado?.nome}
                        </strong>
                        ? Essa ação não poderá ser desfeita.
                    </p>
                }
                erro={erroExclusao}
                carregando={excluindo}
                textoConfirmar="Confirmar exclusão"
                textoCancelar="Cancelar"
                onConfirmar={excluirEquipamento}
                onFechar={fecharModal}
            />
        </div>
    );
}