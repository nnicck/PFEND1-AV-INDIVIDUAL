"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BarraNavegacao from "@/components/BarraNavegacao";

const API = "http://localhost:3001/api";

function dataLocal() {
    const hoje = new Date();

    return [
        hoje.getFullYear(),
        String(hoje.getMonth() + 1).padStart(2, "0"),
        String(hoje.getDate()).padStart(2, "0"),
    ].join("-");
}

function obterLista(resposta) {
    if (Array.isArray(resposta)) return resposta;
    if (Array.isArray(resposta?.dados)) return resposta.dados;
    if (Array.isArray(resposta?.data)) return resposta.data;
    return [];
}

export default function NovaDevolucao() {
    const router = useRouter();

    const [emprestimos, setEmprestimos] = useState([]);
    const [emprestimoSelecionado, setEmprestimoSelecionado] = useState(null);

    const [formulario, setFormulario] = useState({
        emprestimo_id: "",
        data_devolucao: dataLocal(),
        quantidade_devolvida: "1",
    });

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregarDados() {
            try {
                setCarregando(true);
                setErro("");

                const [respostaEmprestimos, respostaDevolucoes] =
                    await Promise.all([
                        fetch(`${API}/emprestimos`),
                        fetch(`${API}/devolucoes`),
                    ]);

                if (!respostaEmprestimos.ok) {
                    throw new Error("Não foi possível carregar os empréstimos.");
                }

                if (!respostaDevolucoes.ok) {
                    throw new Error("Não foi possível carregar as devoluções.");
                }

                const dadosEmprestimos = obterLista(
                    await respostaEmprestimos.json()
                );

                const dadosDevolucoes = obterLista(
                    await respostaDevolucoes.json()
                );

                const pendentes = dadosEmprestimos
                    .map((emprestimo) => {
                        const id = emprestimo.emprestimo_id ?? emprestimo.id;

                        const totalEmprestado = Number(
                            emprestimo.qtd_emprestimo
                        );

                        const totalDevolvido = dadosDevolucoes
                            .filter((devolucao) => {
                                const idDevolucao =
                                    devolucao.emprestimo_id ??
                                    devolucao.id_emprestimo;

                                return Number(idDevolucao) === Number(id);
                            })
                            .reduce(
                                (total, devolucao) =>
                                    total +
                                    Number(
                                        devolucao.quantidade_devolvida || 0
                                    ),
                                0
                            );

                        return {
                            ...emprestimo,
                            id,
                            funcionario_nome:
                                emprestimo.funcionario_nome ??
                                emprestimo.nome_funcionario ??
                                emprestimo.funcionario ??
                                "Funcionário não informado",
                            equipamento_nome:
                                emprestimo.equipamento_nome ??
                                emprestimo.nome_equipamento ??
                                emprestimo.equipamento ??
                                "Equipamento não informado",
                            quantidade_pendente:
                                totalEmprestado - totalDevolvido,
                        };
                    })
                    .filter(
                        (emprestimo) => emprestimo.quantidade_pendente > 0
                    );

                setEmprestimos(pendentes);
            } catch (error) {
                setErro(
                    error.message || "Erro ao carregar os dados da devolução."
                );
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, []);

    function alterarCampo(evento) {
        const { name, value } = evento.target;

        if (name === "emprestimo_id") {
            const selecionado = emprestimos.find(
                (emprestimo) => String(emprestimo.id) === value
            );

            setEmprestimoSelecionado(selecionado || null);

            setFormulario((anterior) => ({
                ...anterior,
                emprestimo_id: value,
                quantidade_devolvida: "1",
            }));

            setErro("");
            return;
        }

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value,
        }));

        setErro("");
    }

    async function registrarDevolucao(evento) {
        evento.preventDefault();
        setErro("");

        if (!emprestimoSelecionado) {
            setErro("Selecione um empréstimo.");
            return;
        }

        const quantidade = Number(formulario.quantidade_devolvida);
        const pendente = Number(
            emprestimoSelecionado.quantidade_pendente
        );

        if (!Number.isInteger(quantidade) || quantidade < 1) {
            setErro("Informe uma quantidade inteira maior que zero.");
            return;
        }

        if (quantidade > pendente) {
            setErro(
                `A quantidade máxima para este empréstimo é ${pendente}.`
            );
            return;
        }

        try {
            setSalvando(true);

            const resposta = await fetch(`${API}/devolucoes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    emprestimo_id: Number(formulario.emprestimo_id),
                    data_devolucao: formulario.data_devolucao,
                    quantidade_devolvida: quantidade,
                }),
            });

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    resultado.mensagem ||
                    resultado.erro ||
                    "Não foi possível registrar a devolução."
                );
            }

            router.push("/devolucoes");
            router.refresh();
        } catch (error) {
            setErro(
                error.message || "Ocorreu um erro ao registrar a devolução."
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="d-flex min-vh-100 bg-light">
            <BarraNavegacao />

            <main className="flex-grow-1 p-3 p-md-5">
                <div
                    className="container-fluid"
                    style={{ maxWidth: "900px" }}
                >
                    <div className="mb-4">
                        <h3
                            className="fw-bold mb-1"
                            style={{ color: "#142D52" }}
                        >
                            Registrar devolução
                        </h3>

                        <small className="text-muted">
                            Preencha os dados para registrar a devolução de um equipamento.
                        </small>
                    </div>

                    <section className="card shadow-sm border-0">
                        <div className="card-header bg-white py-3 px-4">
                            <h5
                                className="mb-1 fw-semibold"
                                style={{ color: "#142D52" }}
                            >
                                Dados da devolução
                            </h5>

                            <small className="text-muted">
                                Os campos marcados são obrigatórios.
                            </small>
                        </div>

                        <div className="card-body p-4">
                            {erro && (
                                <div className="alert alert-danger" role="alert">
                                    {erro}
                                </div>
                            )}

                            {carregando ? (
                                <div className="text-center text-secondary py-5">
                                    Carregando empréstimos...
                                </div>
                            ) : (
                                <form onSubmit={registrarDevolucao}>
                                    <div className="mb-4">
                                        <label
                                            htmlFor="emprestimo_id"
                                            className="form-label fw-semibold"
                                            style={{ color: "#142D52" }}
                                        >
                                            Empréstimo
                                        </label>

                                        <select
                                            id="emprestimo_id"
                                            name="emprestimo_id"
                                            className="form-select"
                                            value={formulario.emprestimo_id}
                                            onChange={alterarCampo}
                                            required
                                        >
                                            <option value="">
                                                Selecione um empréstimo
                                            </option>

                                            {emprestimos.map((emprestimo) => (
                                                <option
                                                    key={emprestimo.id}
                                                    value={emprestimo.id}
                                                >
                                                    {`Empréstimo #${emprestimo.id} — ${emprestimo.funcionario_nome} — ${emprestimo.equipamento_nome} — Pendente: ${emprestimo.quantidade_pendente}`}
                                                </option>
                                            ))}
                                        </select>

                                        {emprestimos.length === 0 && (
                                            <div className="form-text mt-2">
                                                Não existem empréstimos pendentes de devolução.
                                            </div>
                                        )}
                                    </div>

                                    {emprestimoSelecionado && (
                                        <div
                                            className="rounded-3 p-3 p-md-4 mb-4"
                                            style={{
                                                backgroundColor: "#EAF1FA",
                                                border: "1px solid #D5E2F3",
                                            }}
                                        >
                                            <h6
                                                className="fw-bold mb-3"
                                                style={{ color: "#142D52" }}
                                            >
                                                Resumo do empréstimo
                                            </h6>

                                            <div className="row g-3">
                                                <div className="col-12 col-md-6">
                                                    <small className="text-muted d-block mb-1">
                                                        Código
                                                    </small>
                                                    <span
                                                        className="fw-semibold"
                                                        style={{ color: "#142D52" }}
                                                    >
                                                        #{emprestimoSelecionado.id}
                                                    </span>
                                                </div>

                                                <div className="col-12 col-md-6">
                                                    <small className="text-muted d-block mb-1">
                                                        Funcionário
                                                    </small>
                                                    <span className="fw-semibold">
                                                        {emprestimoSelecionado.funcionario_nome}
                                                    </span>
                                                </div>

                                                <div className="col-12 col-md-6">
                                                    <small className="text-muted d-block mb-1">
                                                        Equipamento
                                                    </small>
                                                    <span className="fw-semibold">
                                                        {emprestimoSelecionado.equipamento_nome}
                                                    </span>
                                                </div>

                                                <div className="col-12 col-md-6">
                                                    <small className="text-muted d-block mb-1">
                                                        Quantidade pendente
                                                    </small>
                                                    <span
                                                        className="badge rounded-pill"
                                                        style={{
                                                            backgroundColor: "#142D52",
                                                            color: "#FFFFFF",
                                                            padding: "7px 12px",
                                                        }}
                                                    >
                                                        {emprestimoSelecionado.quantidade_pendente}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="row g-3 mb-3">
                                        <div className="col-12 col-md-6">
                                            <label
                                                htmlFor="data_devolucao"
                                                className="form-label fw-semibold"
                                                style={{ color: "#142D52" }}
                                            >
                                                Data da devolução
                                            </label>

                                            <input
                                                id="data_devolucao"
                                                name="data_devolucao"
                                                type="date"
                                                className="form-control"
                                                value={formulario.data_devolucao}
                                                onChange={alterarCampo}
                                                required
                                            />
                                        </div>

                                        <div className="col-12 col-md-6">
                                            <label
                                                htmlFor="quantidade_devolvida"
                                                className="form-label fw-semibold"
                                                style={{ color: "#142D52" }}
                                            >
                                                Quantidade devolvida
                                            </label>

                                            <input
                                                id="quantidade_devolvida"
                                                name="quantidade_devolvida"
                                                type="number"
                                                className="form-control"
                                                min="1"
                                                max={
                                                    emprestimoSelecionado
                                                        ? emprestimoSelecionado.quantidade_pendente
                                                        : 1
                                                }
                                                step="1"
                                                value={formulario.quantidade_devolvida}
                                                onChange={alterarCampo}
                                                disabled={!emprestimoSelecionado}
                                                required
                                            />

                                            {emprestimoSelecionado && (
                                                <div className="form-text">
                                                    Máximo permitido:{" "}
                                                    {emprestimoSelecionado.quantidade_pendente}.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <hr className="text-secondary opacity-25 my-4" />

                                    <div className="d-flex flex-column-reverse flex-sm-row justify-content-end gap-2">
                                        <Link
                                            href="/devolucoes"
                                            className="btn btn-outline-secondary px-4"
                                            style={{ minWidth: "120px" }}
                                        >
                                            Cancelar
                                        </Link>

                                        <button
                                            type="submit"
                                            className="btn btn-primary px-4"
                                            style={{
                                                backgroundColor: "#142D52",
                                                borderColor: "#142D52",
                                                minWidth: "190px",
                                            }}
                                            disabled={
                                                salvando ||
                                                !emprestimoSelecionado ||
                                                emprestimos.length === 0
                                            }
                                        >
                                            {salvando
                                                ? "Registrando..."
                                                : "Registrar devolução"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}