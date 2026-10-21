"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import CardsResumo from "@/components/CardsResumo";
import BarraNavegacao from "@/components/BarraNavegacao";
import ModalConfirmacao from "@/components/ModalConfirmacao";

const API = "http://localhost:3001/api";

export default function Home() {
const [emprestimos, setEmprestimos] = useState([]);
const [equipamentos, setEquipamentos] = useState([]);
const [erro, setErro] = useState("");
const [carregando, setCarregando] = useState(true);
const [excluindo, setExcluindo] = useState(null);

const [pesquisa, setPesquisa] = useState("");
const [statusFiltro, setStatusFiltro] = useState("");

const [modalAberto, setModalAberto] = useState(false);
const [emprestimoSelecionado, setEmprestimoSelecionado] = useState(null);
const [erroModal, setErroModal] = useState("");

function normalizarData(data) {
    return data ? String(data).slice(0, 10) : "";
}

function formatarData(data) {
    const [ano, mes, dia] = normalizarData(data).split("-");
    return ano && mes && dia ? `${dia}/${mes}/${ano}` : "-";
}

function obterStatus(emprestimo) {
    const status =
        emprestimo.status_atual ??
        emprestimo.status ??
        "Em andamento";

    if (status === "Devolvido" || status === "Atrasado") {
        return status;
    }

    const agora = new Date();

    const hoje = [
        agora.getFullYear(),
        String(agora.getMonth() + 1).padStart(2, "0"),
        String(agora.getDate()).padStart(2, "0")
    ].join("-");

    const devolucao = normalizarData(
        emprestimo.data_prevista_devolucao
    );

    return devolucao && devolucao < hoje
        ? "Atrasado"
        : "Em andamento";
}

async function carregarDados() {
    try {
        setCarregando(true);
        setErro("");

        const respostas = await Promise.all([
            fetch(`${API}/emprestimos`),
            fetch(`${API}/equipamentos`)
        ]);

        if (respostas.some((resposta) => !resposta.ok)) {
            throw new Error("Não foi possível carregar os dados.");
        }

        const resultados = await Promise.all(
            respostas.map((resposta) => resposta.json())
        );

        const listaEmprestimos =
            resultados[0].dados ?? resultados[0];

        const listaEquipamentos =
            resultados[1].dados ?? resultados[1];

        if (
            !Array.isArray(listaEmprestimos) ||
            !Array.isArray(listaEquipamentos)
        ) {
            throw new Error(
                "A API retornou dados em formato inválido."
            );
        }

        setEmprestimos(listaEmprestimos);
        setEquipamentos(listaEquipamentos);
    } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
        setErro(erro.message || "Erro ao carregar os dados.");
    } finally {
        setCarregando(false);
    }
}

useEffect(() => {
    carregarDados();
}, []);

function abrirModalExcluir(emprestimo) {
    const id = emprestimo.emprestimo_id ?? emprestimo.id;

    setEmprestimoSelecionado({
        ...emprestimo,
        id
    });

    setErroModal("");
    setModalAberto(true);
}

function fecharModalExcluir() {
    if (excluindo !== null) return;

    setModalAberto(false);
    setEmprestimoSelecionado(null);
    setErroModal("");
}

async function excluirEmprestimo() {
    if (!emprestimoSelecionado) return;

    const id = emprestimoSelecionado.id;

    setExcluindo(id);
    setErroModal("");

    try {
        const resposta = await fetch(
            `${API}/emprestimos/${id}`,
            {
                method: "DELETE"
            }
        );

        const resultado = await resposta.json().catch(() => ({}));

        if (!resposta.ok) {
            throw new Error(
                resultado.mensagem ||
                resultado.erro ||
                "Não foi possível excluir o empréstimo."
            );
        }

        setEmprestimos((listaAtual) =>
            listaAtual.filter(
                (emprestimo) =>
                    Number(
                        emprestimo.emprestimo_id ?? emprestimo.id
                    ) !== Number(id)
            )
        );

        setModalAberto(false);
        setEmprestimoSelecionado(null);
    } catch (erro) {
        console.error("Erro ao excluir empréstimo:", erro);
        setErroModal(
            erro.message || "Erro ao excluir o empréstimo."
        );
    } finally {
        setExcluindo(null);
    }
}

const resumo = useMemo(() => ({
    emprestimosAtivos: emprestimos.filter((e) =>
        ["Em andamento", "Atrasado"].includes(obterStatus(e))
    ).length,

    devolucoesAtrasadas: emprestimos.filter(
        (e) => obterStatus(e) === "Atrasado"
    ).length,

    totalEpis: equipamentos.reduce(
        (total, e) =>
            total + (Number(e.maximo_equipamentos) || 0),
        0
    ),

    disponivel: equipamentos.reduce(
        (total, e) =>
            total + (Number(e.qtd_disponivel) || 0),
        0
    )
}), [emprestimos, equipamentos]);

const emprestimosFiltrados = useMemo(() => {
    const termo = pesquisa.trim().toLowerCase();

    return emprestimos
        .filter((e) => {
            const id = String(e.emprestimo_id ?? e.id ?? "");
            const funcionario = String(e.funcionario_nome ?? "");
            const equipamento = String(e.equipamento_nome ?? "");

            const correspondePesquisa = [
                id,
                funcionario,
                equipamento
            ].some((valor) =>
                valor.toLowerCase().includes(termo)
            );

            const correspondeStatus =
                !statusFiltro || obterStatus(e) === statusFiltro;

            return correspondePesquisa && correspondeStatus;
        })
        .sort((a, b) => {
            const idA = Number(a.emprestimo_id ?? a.id);
            const idB = Number(b.emprestimo_id ?? b.id);

            return idA - idB;
        });
}, [emprestimos, pesquisa, statusFiltro]);

function limparFiltros() {
    setPesquisa("");
    setStatusFiltro("");
}

function classeStatus(status) {
    if (status === "Devolvido") return "text-bg-success";
    if (status === "Atrasado") return "text-bg-danger";
    return "text-bg-warning";
}

return (
    <div className="d-flex flex-row">
        <BarraNavegacao />

        <main className="flex-grow-1 min-vh-100">
            <div className="container-fluid px-4 mt-5">
                <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                    <div>
                        <h2 className="text-black">
                            Olá! Seja bem-vindo!
                        </h2>

                        <h5 className="text-secondary">
                            Aqui está um resumo dos EPIs e da movimentação do sistema.
                        </h5>
                    </div>

                    <Link
                        href="/emprestimos/novo"
                        className="btn btn-primary"
                    >
                        + Registrar novo empréstimo
                    </Link>
                </div>

                <div className="row justify-content-center g-3 mt-4">
                    <div className="col-12 col-sm-6 col-xl-4">
                        <CardsResumo
                            titEpi="Empréstimos ativos"
                            qtdEpi={resumo.emprestimosAtivos}
                            descEpi="em andamento ou atrasados"
                        />
                    </div>

                    <div className="col-12 col-sm-6 col-xl-4">
                        <CardsResumo
                            titEpi="Devoluções atrasadas"
                            qtdEpi={resumo.devolucoesAtrasadas}
                            descEpi="requerem atenção"
                        />
                    </div>
                </div>

                <div className="card border-0 bg-transparent mt-4 mb-5">
                    <div className="card-header bg-transparent border-0 px-0 py-3">
                        <h5 className="mb-0">
                            Empréstimos recentes
                        </h5>
                    </div>

                    <div className="card-body p-0">
                        <div className="row g-3 align-items-end py-3">
                            <div className="col-12 col-lg-6">
                                <label className="form-label">
                                    Pesquisar
                                </label>

                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="ID, funcionário ou equipamento..."
                                    value={pesquisa}
                                    onChange={(e) =>
                                        setPesquisa(e.target.value)
                                    }
                                />
                            </div>

                            <div className="col-12 col-md-7 col-lg-4">
                                <label className="form-label">
                                    Status
                                </label>

                                <select
                                    className="form-select"
                                    value={statusFiltro}
                                    onChange={(e) =>
                                        setStatusFiltro(e.target.value)
                                    }
                                >
                                    <option value="">
                                        Todos os status
                                    </option>
                                    <option value="Em andamento">
                                        Em andamento
                                    </option>
                                    <option value="Devolvido">
                                        Devolvido
                                    </option>
                                    <option value="Atrasado">
                                        Atrasado
                                    </option>
                                </select>
                            </div>

                            <div className="col-12 col-md-5 col-lg-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary w-100"
                                    onClick={limparFiltros}
                                >
                                    Limpar filtros
                                </button>
                            </div>
                        </div>

                        {erro && (
                            <div className="alert alert-danger">
                                {erro}
                            </div>
                        )}

                        {carregando && (
                            <p className="text-secondary py-3">
                                Carregando empréstimos...
                            </p>
                        )}

                        <div className="table-responsive">
                            <table className="table align-middle">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Data</th>
                                        <th>Funcionário</th>
                                        <th>Equipamento</th>
                                        <th>Quantidade</th>
                                        <th>Devolução prevista</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {!carregando && !erro &&
                                        emprestimosFiltrados.map((e) => {
                                            const id =
                                                e.emprestimo_id ?? e.id;

                                            const status = obterStatus(e);

                                            return (
                                                <tr key={id}>
                                                    <td className="text-primary">
                                                        {id}
                                                    </td>

                                                    <td>
                                                        {formatarData(e.data_emprestimo)}
                                                    </td>

                                                    <td>
                                                        {e.funcionario_nome ?? "-"}
                                                    </td>

                                                    <td>
                                                        {e.equipamento_nome ?? "-"}
                                                    </td>

                                                    <td>
                                                        {e.qtd_emprestimo ?? "-"}
                                                    </td>

                                                    <td>
                                                        {formatarData(e.data_prevista_devolucao)}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`badge ${classeStatus(status)}`}
                                                        >
                                                            {status}
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="d-flex gap-2">
                                                            <Link
                                                                href={`/emprestimos/editar/${id}`}
                                                                className="btn btn-primary btn-sm"
                                                            >
                                                                Editar
                                                            </Link>

                                                            <button
                                                                type="button"
                                                                className="btn btn-danger btn-sm"
                                                                disabled={excluindo !== null}
                                                                onClick={() =>
                                                                    abrirModalExcluir(e)
                                                                }
                                                            >
                                                                Excluir
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                    {!carregando && !erro &&
                                        emprestimosFiltrados.length === 0 && (
                                            <tr>
                                                <td
                                                    colSpan={8}
                                                    className="text-center text-secondary py-4"
                                                >
                                                    Nenhum empréstimo encontrado.
                                                </td>
                                            </tr>
                                        )}
                                </tbody>
                            </table>
                        </div>

                        {!carregando && !erro && (
                            <p className="text-secondary small mt-2">
                                Exibindo {emprestimosFiltrados.length} de{" "}
                                {emprestimos.length} empréstimos.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </main>

        <ModalConfirmacao
            aberto={modalAberto}
            titulo="Excluir empréstimo"
            mensagem={
                emprestimoSelecionado
                    ? `Tem certeza que deseja excluir o empréstimo ${emprestimoSelecionado.id}? Essa ação não pode ser desfeita.`
                    : "Tem certeza que deseja excluir este empréstimo?"
            }
            erro={erroModal}
            carregando={excluindo !== null}
            textoConfirmar="Excluir empréstimo"
            textoCancelar="Cancelar"
            onConfirmar={excluirEmprestimo}
            onFechar={fecharModalExcluir}
        />
    </div>
);

}