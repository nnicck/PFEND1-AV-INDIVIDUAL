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

    // Controla o modal e guarda o equipamento selecionado para exclusão.
    const [modalAberto, setModalAberto] = useState(false);
    const [equipamentoSelecionado, setEquipamentoSelecionado] = useState(null);
    const [erroExclusao, setErroExclusao] = useState("");
    const [excluindo, setExcluindo] = useState(false);

    // Busca os equipamentos cadastrados no banco por meio da API.
    useEffect(() => {
        async function carregarEquipamentos() {
            try {
                const resposta = await fetch(`${API}/equipamentos`);

                if (!resposta.ok) {
                    throw new Error("Erro ao buscar equipamentos.");
                }

                const resultado = await resposta.json();

                // Aceita tanto uma lista direta quanto uma lista dentro de "dados".
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

    // Abre o modal e prepara a confirmação para o equipamento escolhido.
    function abrirModal(equipamento) {
        setEquipamentoSelecionado(equipamento);
        setErroExclusao("");
        setModalAberto(true);
    }

    // Fecha o modal e limpa os dados temporários da exclusão.
    function fecharModal() {
        if (excluindo) return;

        setModalAberto(false);
        setEquipamentoSelecionado(null);
        setErroExclusao("");
    }

    async function excluirEquipamento() {
        try {
            setExcluindo(true);
            setErroExclusao("");

            // Solicita ao backend a exclusão do equipamento selecionado.
            const resposta = await fetch(
                `${API}/equipamentos/${equipamentoSelecionado.id}`,
                { method: "DELETE" }
            );

            // Lê a resposta da API, inclusive quando ela não retorna JSON válido.
            const resultado = await resposta.json().catch(() => ({}));

            // Se houver erro, utiliza a mensagem enviada pelo backend.
            if (!resposta.ok) {
                throw new Error(
                    resultado.message ||
                    "Não é possível excluir este equipamento porque existem empréstimos vinculados a ele."
                );
            }

            // Remove o equipamento da tela somente após a exclusão ser confirmada.
            setEquipamentos((anteriores) =>
                anteriores.filter(
                    (equipamento) =>
                        Number(equipamento.id) !==
                        Number(equipamentoSelecionado.id)
                )
            );

            // Fecha o modal após a exclusão bem-sucedida.
            setModalAberto(false);
            setEquipamentoSelecionado(null);

        } catch (error) {
            // Mantém o modal aberto para exibir o motivo da falha.
            console.error("Erro ao excluir equipamento:", error);
            setErroExclusao(error.message);
        } finally {
            // Libera os botões novamente após terminar a requisição.
            setExcluindo(false);
        }
    }

    // Define o status de acordo com as quantidades total e disponível.
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

                {/* Campo de pesquisa e link para cadastrar um equipamento. */}
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
                                onChange={(e) => setPesquisa(e.target.value)}
                            />
                        </div>

                        <div>
                            <Link
                                href="/equipamentos/novo"
                                className="btn btn-primary"
                            >
                                + Registrar novo equipamento
                            </Link>
                        </div>
                    </div>
                </section>

                {/* A contagem acompanha a pesquisa realizada. */}
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
                    <div className="alert alert-danger">{erro}</div>
                )}

                {/* Exibe a tabela somente depois de carregar os dados. */}
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
                                        <td
                                            colSpan="7"
                                            className="text-center text-secondary py-4"
                                        >
                                            Nenhum equipamento encontrado.
                                        </td>
                                    </tr>
                                ) : (
                                    equipamentosFiltrados.map((equipamento) => {
                                        const status = obterStatus(equipamento);

                                        return (
                                            <tr key={equipamento.id}>
                                                <th
                                                    scope="row"
                                                    className="text-primary"
                                                >
                                                    {equipamento.id}
                                                </th>

                                                <td>{equipamento.nome}</td>
                                                <td>{equipamento.categoria}</td>
                                                <td>
                                                    {equipamento.maximo_equipamentos}
                                                </td>
                                                <td>
                                                    {equipamento.qtd_disponivel}
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
                                                            href={`/equipamentos/editar/${equipamento.id}`}
                                                            className="btn btn-primary btn-sm"
                                                        >
                                                            Editar
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() =>
                                                                abrirModal(equipamento)
                                                            }
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

            {/* Modal de confirmação: também apresenta os erros da exclusão. */}
            {modalAberto && (
                <div
                    className="modal d-block"
                    tabIndex="-1"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="tituloModal"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow">
                            <div className="modal-header">
                                <h5
                                    className="modal-title fw-bold"
                                    id="tituloModal"
                                >
                                    {erroExclusao
                                        ? "Não foi possível excluir"
                                        : "Confirmar exclusão"}
                                </h5>

                                {!excluindo && (
                                    <button
                                        type="button"
                                        className="btn-close"
                                        aria-label="Fechar"
                                        onClick={fecharModal}
                                    />
                                )}
                            </div>

                            <div className="modal-body">
                                {erroExclusao ? (
                                    // Mostra o erro retornado pelo backend.
                                    <div className="alert alert-danger mb-0">
                                        {erroExclusao}
                                    </div>
                                ) : (
                                    <p className="mb-0">
                                        Tem certeza de que deseja excluir o
                                        equipamento{" "}
                                        <strong>
                                            {equipamentoSelecionado?.nome}
                                        </strong>
                                        ? Essa ação não poderá ser desfeita.
                                    </p>
                                )}
                            </div>

                            {/* Mantém os botões centralizados no modal. */}
                            <div className="modal-footer justify-content-center">
                                {erroExclusao ? (
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={fecharModal}
                                    >
                                        Fechar
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={fecharModal}
                                            disabled={excluindo}
                                        >
                                            Cancelar
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            onClick={excluirEquipamento}
                                            disabled={excluindo}
                                        >
                                            {excluindo
                                                ? "Excluindo..."
                                                : "Confirmar exclusão"}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}