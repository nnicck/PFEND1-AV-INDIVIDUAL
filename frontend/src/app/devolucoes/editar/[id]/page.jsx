"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import BarraNavegacao from "@/components/BarraNavegacao";

const API = "http://localhost:3001/api";

export default function EditarDevolucao() {
const params = useParams();
const id = Array.isArray(params.id) ? params.id[0] : params.id;
const router = useRouter();

// Dados da devolução que serão editados.
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

// Formata a data para o formato aceito pelo input date.
function obterData(data) {
    return data ? String(data).slice(0, 10) : "";
}

// Aceita listas retornadas diretamente ou dentro de dados/data.
function obterLista(resposta) {
    const dados = resposta?.dados ?? resposta?.data ?? resposta;
    return Array.isArray(dados) ? dados : [];
}

// Carrega a devolução selecionada e a lista de empréstimos.
useEffect(() => {
    if (!id) {
        setCarregando(false);
        return;
    }

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

            let dados =
                jsonDevolucao?.dados ??
                jsonDevolucao?.data ??
                jsonDevolucao;

            if (Array.isArray(dados)) {
                dados = dados[0];
            }

            if (!dados) {
                throw new Error("Devolução não encontrada.");
            }

            // Preenche o formulário com os dados existentes.
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
            setErro(error.message || "Erro ao carregar os dados.");
        } finally {
            setCarregando(false);
        }
    }

    carregarDados();
}, [id]);

// Atualiza os campos conforme o usuário altera os valores.
function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setDevolucao((anterior) => ({
        ...anterior,
        [name]: value,
    }));

    setErro("");
}

// Valida e envia as alterações para a API.
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

    try {
        setSalvando(true);

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

        // Retorna à listagem após atualizar com sucesso.
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

return (
    <div className="d-flex min-vh-100 bg-light">
        <BarraNavegacao />

        <main className="flex-grow-1 p-4">
            {/* Cabeçalho no mesmo padrão da edição de funcionários. */}
            <div className="mb-4">

                <h2 className="fw-bold mt-3 mb-1 text-primary">
                    Editar devolução
                </h2>

                <p className="text-secondary mb-0">
                    Atualize os dados da devolução registrada.
                </p>
            </div>

            {/* Estado de carregamento dos dados. */}
            {carregando ? (
                <p className="text-secondary">
                    Carregando devolução...
                </p>
            ) : (
                <section className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                        <h3 className="h5 fw-bold text-primary mb-4">
                            Dados da devolução #{id}
                        </h3>

                        {/* Exibe erros de carregamento ou validação. */}
                        {erro && (
                            <div
                                className="alert alert-danger"
                                role="alert"
                            >
                                {erro}
                            </div>
                        )}

                        <form onSubmit={salvarAlteracoes}>
                            <div className="row g-3">
                                {/* Empréstimo relacionado à devolução. */}
                                <div className="col-12">
                                    <label
                                        htmlFor="emprestimo_id"
                                        className="form-label fw-semibold"
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

                                {/* Data registrada para a devolução. */}
                                <div className="col-md-6">
                                    <label
                                        htmlFor="data_devolucao"
                                        className="form-label fw-semibold"
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

                                {/* Quantidade de equipamentos devolvidos. */}
                                <div className="col-md-6">
                                    <label
                                        htmlFor="quantidade_devolvida"
                                        className="form-label fw-semibold"
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

                                {/* Situação atual da devolução. */}
                                <div className="col-md-6">
                                    <label
                                        htmlFor="status"
                                        className="form-label fw-semibold"
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
                            </div>

                            <hr className="my-4" />

                            {/* Ações do formulário. */}
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
                </section>
            )}
        </main>
    </div>
);

}