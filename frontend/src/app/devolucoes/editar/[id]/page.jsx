"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const API = "http://localhost:3001/api";

export default function EditarDevolucao() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const router = useRouter();

    const [devolucao, setDevolucao] = useState({
        emprestimo_id: "",
        data_devolucao: "",
        quantidade_devolvida: "1",
        status: "Em andamento",
    });

    const [emprestimos, setEmprestimos] = useState([]);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    function obterData(data) {
        return data ? String(data).slice(0, 10) : "";
    }

    function obterLista(resposta) {
        const dados = resposta?.dados ?? resposta?.data ?? resposta;
        return Array.isArray(dados) ? dados : [];
    }

    useEffect(() => {
        if (!id) return;

        async function carregarDados() {
            try {
                setErro("");
                setCarregando(true);

                const [resDevolucao, resEmprestimos] = await Promise.all([
                    fetch(`${API}/devolucoes/${id}`),
                    fetch(`${API}/emprestimos`),
                ]);

                const [jsonDevolucao, jsonEmprestimos] = await Promise.all([
                    resDevolucao.json(),
                    resEmprestimos.json(),
                ]);

                if (!resDevolucao.ok) {
                    throw new Error(
                        jsonDevolucao.mensagem ||
                        jsonDevolucao.erro ||
                        "Não foi possível encontrar a devolução."
                    );
                }

                if (!resEmprestimos.ok) {
                    throw new Error(
                        "Não foi possível carregar os empréstimos."
                    );
                }

                let dados = jsonDevolucao?.dados ?? jsonDevolucao?.data ?? jsonDevolucao;

                if (Array.isArray(dados)) {
                    dados = dados[0];
                }

                if (!dados) {
                    throw new Error("Devolução não encontrada.");
                }

                setDevolucao({
                    emprestimo_id: String(
                        dados.emprestimo_id ??
                        dados.id_emprestimo ??
                        ""
                    ),
                    data_devolucao: obterData(dados.data_devolucao),
                    quantidade_devolvida: String(
                        dados.quantidade_devolvida ??
                        dados.qtd_devolvida ??
                        1
                    ),
                    status: dados.status ?? "Em andamento",
                });

                setEmprestimos(obterLista(jsonEmprestimos));
            } catch (error) {
                setErro(
                    error.message || "Erro ao carregar os dados."
                );
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, [id]);

    function atualizarCampo(evento) {
        const { name, value } = evento.target;

        setDevolucao((anterior) => ({
            ...anterior,
            [name]: value,
        }));

        setErro("");
    }

    async function salvarAlteracoes(evento) {
        evento.preventDefault();
        setErro("");

        const quantidade = Number(devolucao.quantidade_devolvida);

        if (!devolucao.emprestimo_id) {
            setErro("Selecione o empréstimo relacionado.");
            return;
        }

        if (!devolucao.data_devolucao) {
            setErro("Informe a data da devolução.");
            return;
        }

        if (!Number.isInteger(quantidade) || quantidade < 1) {
            setErro("Informe uma quantidade inteira maior que zero.");
            return;
        }

        setSalvando(true);

        try {
            const resposta = await fetch(`${API}/devolucoes/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    emprestimo_id: Number(devolucao.emprestimo_id),
                    data_devolucao: devolucao.data_devolucao,
                    quantidade_devolvida: quantidade,
                    status: devolucao.status,
                }),
            });

            const resultado = await resposta.json().catch(() => ({}));

            if (!resposta.ok) {
                throw new Error(
                    resultado.mensagem ||
                    resultado.erro ||
                    "Erro ao atualizar a devolução."
                );
            }

            router.push("/devolucoes");
            router.refresh();
        } catch (error) {
            setErro(
                error.message ||
                "Não foi possível salvar as alterações."
            );
        } finally {
            setSalvando(false);
        }
    }

    if (carregando) {
        return (
            <main className="container py-5">
                <p>Carregando devolução...</p>
            </main>
        );
    }

    if (erro && !devolucao.data_devolucao) {
        return (
            <main className="container py-5">
                <div className="alert alert-danger">{erro}</div>

                <Link
                    href="/devolucoes"
                    className="btn btn-secondary"
                >
                    Voltar
                </Link>
            </main>
        );
    }

    return (
        <main className="container py-5">
            <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3">
                    <h3 className="mb-0">
                        Editar devolução #{id}
                    </h3>

                    <small className="text-muted">
                        Atualize as informações da devolução registrada.
                    </small>
                </div>

                <div className="card-body p-4">
                    {erro && (
                        <div className="alert alert-danger" role="alert">
                            {erro}
                        </div>
                    )}

                    <form onSubmit={salvarAlteracoes}>
                        <div className="mb-3">
                            <label
                                htmlFor="emprestimo_id"
                                className="form-label"
                            >
                                Empréstimo relacionado
                            </label>

                            <select
                                id="emprestimo_id"
                                name="emprestimo_id"
                                className="form-select"
                                value={devolucao.emprestimo_id}
                                onChange={atualizarCampo}
                                required
                            >
                                <option value="">
                                    Selecione um empréstimo
                                </option>

                                {emprestimos.map((emprestimo) => {
                                    const emprestimoId =
                                        emprestimo.emprestimo_id ??
                                        emprestimo.id;

                                    return (
                                        <option
                                            key={emprestimoId}
                                            value={emprestimoId}
                                        >
                                            {`Empréstimo #${emprestimoId} - ${
                                                emprestimo.funcionario_nome ??
                                                emprestimo.nome_funcionario ??
                                                emprestimo.funcionario ??
                                                "Funcionário"
                                            } - ${
                                                emprestimo.equipamento_nome ??
                                                emprestimo.nome_equipamento ??
                                                emprestimo.equipamento ??
                                                "Equipamento"
                                            }`}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label
                                htmlFor="data_devolucao"
                                className="form-label"
                            >
                                Data da devolução
                            </label>

                            <input
                                id="data_devolucao"
                                type="date"
                                name="data_devolucao"
                                className="form-control"
                                value={devolucao.data_devolucao}
                                onChange={atualizarCampo}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label
                                htmlFor="quantidade_devolvida"
                                className="form-label"
                            >
                                Quantidade devolvida
                            </label>

                            <input
                                id="quantidade_devolvida"
                                type="number"
                                name="quantidade_devolvida"
                                className="form-control"
                                min="1"
                                step="1"
                                value={devolucao.quantidade_devolvida}
                                onChange={atualizarCampo}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label
                                htmlFor="status"
                                className="form-label"
                            >
                                Status
                            </label>

                            <select
                                id="status"
                                name="status"
                                className="form-select"
                                value={devolucao.status}
                                onChange={atualizarCampo}
                                required
                            >
                                <option value="Em andamento">
                                    Em andamento
                                </option>

                                <option value="Devolução parcial">
                                    Devolução parcial
                                </option>

                                <option value="Devolvido">
                                    Devolvido
                                </option>
                            </select>
                        </div>

                        <div className="d-flex justify-content-end gap-2">
                            <Link
                                href="/devolucoes"
                                className="btn btn-outline-secondary"
                            >
                                Cancelar
                            </Link>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={salvando}
                            >
                                {salvando
                                    ? "Salvando..."
                                    : "Salvar alterações"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}