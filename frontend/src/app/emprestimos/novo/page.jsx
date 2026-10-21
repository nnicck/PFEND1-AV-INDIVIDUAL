
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BarraNavegacao from "@/components/BarraNavegacao";

const API = "http://localhost:3001/api";

function obterDataLocal() {
    const hoje = new Date();

    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

async function lerResposta(resposta) {
    return resposta.json().catch(() => ({}));
}

function obterLista(resultado, propriedade) {
    if (Array.isArray(resultado)) {
        return resultado;
    }

    if (Array.isArray(resultado?.dados)) {
        return resultado.dados;
    }

    if (Array.isArray(resultado?.data)) {
        return resultado.data;
    }

    if (Array.isArray(resultado?.[propriedade])) {
        return resultado[propriedade];
    }

    return [];
}

export default function NovoEmprestimo() {
    const router = useRouter();

    const [funcionarios, setFuncionarios] = useState([]);
    const [equipamentos, setEquipamentos] = useState([]);

    const [formulario, setFormulario] = useState({
        funcionario_id: "",
        equipamento_id: "",
        data_emprestimo: obterDataLocal(),
        data_prevista_devolucao: "",
        qtd_emprestimo: "1",
    });

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");
    const [sucesso, setSucesso] = useState("");

    useEffect(() => {
        async function carregarDados() {
            setCarregando(true);
            setErro("");

            try {
                const [respostaFuncionarios, respostaEquipamentos] =
                    await Promise.all([
                        fetch(`${API}/funcionarios`),
                        fetch(`${API}/equipamentos`),
                    ]);

                const [dadosFuncionarios, dadosEquipamentos] =
                    await Promise.all([
                        lerResposta(respostaFuncionarios),
                        lerResposta(respostaEquipamentos),
                    ]);

                if (!respostaFuncionarios.ok) {
                    throw new Error(
                        dadosFuncionarios.mensagem ||
                        dadosFuncionarios.erro ||
                        "Não foi possível carregar os funcionários."
                    );
                }

                if (!respostaEquipamentos.ok) {
                    throw new Error(
                        dadosEquipamentos.mensagem ||
                        dadosEquipamentos.erro ||
                        "Não foi possível carregar os equipamentos."
                    );
                }

                const listaFuncionarios = obterLista(
                    dadosFuncionarios,
                    "funcionarios"
                );

                const listaEquipamentos = obterLista(
                    dadosEquipamentos,
                    "equipamentos"
                );

                const funcionariosAtivos = listaFuncionarios.filter(
                    (funcionario) => {
                        const status = String(
                            funcionario.status_funcionarios ??
                            funcionario.status ??
                            "Ativo"
                        ).toLowerCase();

                        return status === "ativo";
                    }
                );

                setFuncionarios(funcionariosAtivos);
                setEquipamentos(listaEquipamentos);
            } catch (error) {
                console.error("Erro ao carregar dados:", error);

                setErro(
                    error.message ||
                    "Não foi possível carregar os dados do formulário."
                );
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, []);

    const equipamentoSelecionado = equipamentos.find(
        (equipamento) =>
            String(equipamento.id) === formulario.equipamento_id
    );

    const quantidadeDisponivel = Number(
        equipamentoSelecionado?.qtd_disponivel ?? 0
    );

    function atualizarCampo(evento) {
        const { name, value } = evento.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value,
        }));

        setErro("");
        setSucesso("");
    }

    async function cadastrarEmprestimo(evento) {
        evento.preventDefault();

        if (salvando) {
            return;
        }

        setErro("");
        setSucesso("");

        const funcionarioId = Number(formulario.funcionario_id);
        const equipamentoId = Number(formulario.equipamento_id);
        const quantidade = Number(formulario.qtd_emprestimo);

        if (!funcionarioId || !equipamentoId) {
            setErro("Selecione um funcionário e um equipamento.");
            return;
        }

        if (!formulario.data_emprestimo ||
            !formulario.data_prevista_devolucao) {
            setErro("Preencha as duas datas.");
            return;
        }

        if (
            formulario.data_prevista_devolucao <
            formulario.data_emprestimo
        ) {
            setErro(
                "A data prevista para devolução não pode ser anterior à data do empréstimo."
            );
            return;
        }

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            setErro("Informe uma quantidade inteira maior que zero.");
            return;
        }

        if (!equipamentoSelecionado) {
            setErro("O equipamento selecionado não foi encontrado.");
            return;
        }

        if (quantidade > quantidadeDisponivel) {
            setErro(
                `Quantidade indisponível. Existem ${quantidadeDisponivel} unidade(s) disponíveis.`
            );
            return;
        }

        setSalvando(true);

        try {
            const resposta = await fetch(`${API}/emprestimos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    funcionario_id: funcionarioId,
                    equipamento_id: equipamentoId,
                    data_emprestimo: formulario.data_emprestimo,
                    data_prevista_devolucao:
                        formulario.data_prevista_devolucao,
                    qtd_emprestimo: quantidade,
                }),
            });

            const resultado = await lerResposta(resposta);

            if (!resposta.ok) {
                throw new Error(
                    resultado.mensagem ||
                    resultado.erro ||
                    "Não foi possível registrar o empréstimo."
                );
            }

            setSucesso("Empréstimo registrado com sucesso!");

            router.push("/");
            router.refresh();
        } catch (error) {
            console.error("Erro ao registrar empréstimo:", error);

            setErro(
                error.message ||
                "Ocorreu um erro ao registrar o empréstimo."
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div
            className="d-flex min-vh-100"
            style={{ backgroundColor: "#F4F6F9" }}
        >
            <BarraNavegacao />

            <main className="flex-grow-1 p-3 p-md-4">
                <div
                    className="container-fluid"
                    style={{ maxWidth: "1100px" }}
                >
                    <div className="mb-4">
                        <h1 className="fw-bold mt-3 mb-2 text-black">
                            Novo empréstimo
                        </h1>

                        <p className="text-secondary mb-0">
                            Preencha os dados para registrar a retirada
                            de equipamentos.
                        </p>
                    </div>

                    <div
                        className="card border-0 shadow-sm"
                        style={{ borderRadius: "12px" }}
                    >
                        <div className="card-body p-3 p-md-4">
                            <h2
                                className="h5 fw-bold mb-4"
                                style={{ color: "#142D52" }}
                            >
                                Dados do empréstimo
                            </h2>

                            {erro && (
                                <div
                                    className="alert alert-danger"
                                    role="alert"
                                >
                                    {erro}
                                </div>
                            )}

                            {sucesso && (
                                <div
                                    className="alert alert-success"
                                    role="alert"
                                >
                                    {sucesso}
                                </div>
                            )}

                            {carregando ? (
                                <div className="text-center py-5">
                                    <div
                                        className="spinner-border"
                                        role="status"
                                        style={{ color: "#142D52" }}
                                    >
                                        <span className="visually-hidden">
                                            Carregando...
                                        </span>
                                    </div>

                                    <p className="text-secondary mt-3 mb-0">
                                        Carregando funcionários e equipamentos...
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={cadastrarEmprestimo}>
                                    <div className="row g-4">
                                        <div className="col-12 col-md-6">
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
                                                value={formulario.funcionario_id}
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
                                                        {funcionario.setor
                                                            ? ` — ${funcionario.setor}`
                                                            : ""}
                                                    </option>
                                                ))}
                                            </select>

                                            {funcionarios.length === 0 && (
                                                <small className="text-danger d-block mt-2">
                                                    Nenhum funcionário ativo foi encontrado.
                                                </small>
                                            )}
                                        </div>

                                        <div className="col-12 col-md-6">
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
                                                value={formulario.equipamento_id}
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
                                                        disabled={
                                                            Number(
                                                                equipamento.qtd_disponivel
                                                            ) <= 0
                                                        }
                                                    >
                                                        {equipamento.nome}
                                                        {" — Disponíveis: "}
                                                        {equipamento.qtd_disponivel ?? 0}
                                                    </option>
                                                ))}
                                            </select>

                                            {equipamentoSelecionado && (
                                                <small className="text-secondary d-block mt-2">
                                                    Quantidade disponível:{" "}
                                                    <strong>
                                                        {quantidadeDisponivel}
                                                    </strong>
                                                </small>
                                            )}

                                            {equipamentos.length === 0 && (
                                                <small className="text-danger d-block mt-2">
                                                    Nenhum equipamento foi encontrado.
                                                </small>
                                            )}
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label
                                                htmlFor="data_emprestimo"
                                                className="form-label fw-semibold"
                                            >
                                                Data do empréstimo
                                            </label>

                                            <input
                                                type="date"
                                                id="data_emprestimo"
                                                name="data_emprestimo"
                                                className="form-control"
                                                value={formulario.data_emprestimo}
                                                onChange={atualizarCampo}
                                                required
                                            />
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label
                                                htmlFor="data_prevista_devolucao"
                                                className="form-label fw-semibold"
                                            >
                                                Data prevista para devolução
                                            </label>

                                            <input
                                                type="date"
                                                id="data_prevista_devolucao"
                                                name="data_prevista_devolucao"
                                                className="form-control"
                                                value={
                                                    formulario.data_prevista_devolucao
                                                }
                                                onChange={atualizarCampo}
                                                min={formulario.data_emprestimo}
                                                required
                                            />
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label
                                                htmlFor="qtd_emprestimo"
                                                className="form-label fw-semibold"
                                            >
                                                Quantidade
                                            </label>

                                            <input
                                                type="number"
                                                id="qtd_emprestimo"
                                                name="qtd_emprestimo"
                                                className="form-control"
                                                min="1"
                                                max={quantidadeDisponivel}
                                                step="1"
                                                value={formulario.qtd_emprestimo}
                                                onChange={atualizarCampo}
                                                required
                                            />

                                            <small className="text-secondary d-block mt-2">
                                                Informe quantas unidades serão retiradas.
                                            </small>
                                        </div>
                                    </div>

                                    <hr className="my-4" />

                                    <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
                                        <Link
                                            href="/"
                                            className="btn btn-outline-secondary"
                                        >
                                            Cancelar
                                        </Link>

                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={
                                                salvando ||
                                                carregando ||
                                                funcionarios.length === 0 ||
                                                equipamentos.length === 0
                                            }
                                        >
                                            {salvando ? (
                                                <>
                                                    <span
                                                        className="spinner-border spinner-border-sm me-2"
                                                        aria-hidden="true"
                                                    />
                                                    Registrando...
                                                </>
                                            ) : (
                                                "Registrar empréstimo"
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}