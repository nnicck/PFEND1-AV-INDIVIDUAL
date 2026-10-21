"use client";

import { useEffect, useState } from "react";
import BarraNavegacao from "@/components/BarraNavegacao";
import ModalConfirmacao from "@/components/ModalConfirmacao";
import Link from "next/link";

const API = "http://localhost:3001/api";

export default function Devolucoes() {
const [devolucoes, setDevolucoes] = useState([]);
const [pesquisa, setPesquisa] = useState("");
const [carregando, setCarregando] = useState(true);
const [erro, setErro] = useState("");

const [modalAberto, setModalAberto] = useState(false);
const [devolucaoSelecionada, setDevolucaoSelecionada] = useState(null);
const [erroExclusao, setErroExclusao] = useState("");
const [excluindo, setExcluindo] = useState(false);

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

            if (!Array.isArray(lista)) {
                throw new Error(
                    "A API retornou os dados em formato inválido."
                );
            }

            setDevolucoes(lista);
        } catch (error) {
            console.error("Erro ao carregar devoluções:", error);
            setErro(
                error.message || "Não foi possível carregar as devoluções."
            );
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

const devolucoesFiltradas = devolucoes
    .filter((devolucao) => {
        const id = String(devolucao.emprestimo_id ?? "");
        const funcionario = String(
            devolucao.funcionario_nome ??
            devolucao.funcionario ??
            ""
        );
        const equipamento = String(
            devolucao.equipamento_nome ??
            devolucao.equipamento ??
            ""
        );

        return [id, funcionario, equipamento].some((valor) =>
            valor.toLowerCase().includes(termo)
        );
    })
    .sort((a, b) => Number(a.id) - Number(b.id));

function abrirModal(devolucao) {
    setDevolucaoSelecionada(devolucao);
    setErroExclusao("");
    setModalAberto(true);
}

function fecharModal() {
    if (excluindo) return;

    setModalAberto(false);
    setDevolucaoSelecionada(null);
    setErroExclusao("");
}

async function excluirDevolucao() {
    if (!devolucaoSelecionada || excluindo) return;

    try {
        setExcluindo(true);
        setErroExclusao("");

        const resposta = await fetch(
            `${API}/devolucoes/${devolucaoSelecionada.id}`,
            {
                method: "DELETE"
            }
        );

        const resultado = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(
                resultado.mensagem ||
                resultado.erro ||
                resultado.message ||
                "Não foi possível excluir a devolução."
            );
        }

        setDevolucoes((anteriores) =>
            anteriores.filter(
                (devolucao) =>
                    Number(devolucao.id) !==
                    Number(devolucaoSelecionada.id)
            )
        );

        setModalAberto(false);
        setDevolucaoSelecionada(null);
    } catch (error) {
        console.error("Erro ao excluir devolução:", error);

        setErroExclusao(
            error.message ||
            "Não foi possível excluir a devolução. Verifique a API e as regras de estoque."
        );
    } finally {
        setExcluindo(false);
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
                            placeholder="ID, funcionário ou equipamento..."
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
                                                    disabled={excluindo}
                                                    onClick={() =>
                                                        abrirModal(devolucao)
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

        <ModalConfirmacao
            aberto={modalAberto}
            titulo={
                erroExclusao
                    ? "Não foi possível excluir"
                    : "Confirmar exclusão"
            }
            mensagem={
                <p className="mb-0">
                    Tem certeza de que deseja excluir a devolução do
                    empréstimo{" "}
                    <strong>
                        #{devolucaoSelecionada?.emprestimo_id ?? "-"}
                    </strong>
                    ? Essa ação não poderá ser desfeita.
                </p>
            }
            erro={erroExclusao}
            carregando={excluindo}
            textoConfirmar="Confirmar exclusão"
            textoCancelar="Cancelar"
            onConfirmar={excluirDevolucao}
            onFechar={fecharModal}
        />
    </div>
);

}