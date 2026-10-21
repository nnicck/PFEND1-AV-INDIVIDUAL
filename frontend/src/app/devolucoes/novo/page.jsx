"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BarraNavegacao from "@/components/BarraNavegacao";

const API = "http://localhost:3001/api";

// Retorna a data atual no formato YYYY-MM-DD, usado pelo input date.
function dataLocal() {
const hoje = new Date();

return [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
].join("-");

}

// Aceita diferentes formatos de resposta retornados pela API.
function obterLista(resposta) {
if (Array.isArray(resposta)) return resposta;
if (Array.isArray(resposta?.dados)) return resposta.dados;
if (Array.isArray(resposta?.data)) return resposta.data;

return [];

}

export default function NovaDevolucao() {
const router = useRouter();

// Armazena os empréstimos que ainda possuem equipamentos pendentes.
const [emprestimos, setEmprestimos] = useState([]);

// Armazena o empréstimo selecionado no formulário.
const [emprestimoSelecionado, setEmprestimoSelecionado] = useState(null);

// Controla os campos preenchidos pelo usuário.
const [formulario, setFormulario] = useState({
    emprestimo_id: "",
    data_devolucao: dataLocal(),
    quantidade_devolvida: "1",
});

// Controla o carregamento, o envio e as mensagens de erro.
const [carregando, setCarregando] = useState(true);
const [salvando, setSalvando] = useState(false);
const [erro, setErro] = useState("");

// Busca os empréstimos e as devoluções para calcular as quantidades pendentes.
useEffect(() => {
    async function carregarDados() {
        try {
            setCarregando(true);
            setErro("");

            // Faz as duas requisições ao mesmo tempo.
            const [respostaEmprestimos, respostaDevolucoes] =
                await Promise.all([
                    fetch(`${API}/emprestimos`),
                    fetch(`${API}/devolucoes`),
                ]);

            if (!respostaEmprestimos.ok) {
                throw new Error(
                    respostaEmprestimos.mensagem || 
                    respostaEmprestimos.erro ||
                    "Não foi possível carregar os empréstimos.");
            }

            if (!respostaDevolucoes.ok) {
                throw new Error(
                    respostaDevolucoes.mensagem || 
                    respostaDevolucoes.erro || 
                    "Não foi possível carregar as devoluções.");
            }

            const dadosEmprestimos = obterLista(
                await respostaEmprestimos.json()
            );

            const dadosDevolucoes = obterLista(
                await respostaDevolucoes.json()
            );


            // Calcula quantos equipamentos ainda faltam ser devolvidos.
            const pendentes = dadosEmprestimos
                .map((emprestimo) => {
                    const id = emprestimo.emprestimo_id ?? emprestimo.id;

                    const totalEmprestado = Number(
                        emprestimo.qtd_emprestimo
                    );

                    // Soma as quantidades já devolvidas deste empréstimo.
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
                                Number(devolucao.quantidade_devolvida || 0),
                            0
                        );

                    return {
                        ...emprestimo,
                        id,

                        // Aceita nomes de campos diferentes da API.
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
                // Exibe somente empréstimos que ainda possuem pendências.
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

// Atualiza os campos do formulário quando o usuário altera seus valores.
function alterarCampo(evento) {
    const { name, value } = evento.target;

    // Ao selecionar um empréstimo, recupera seus dados e reinicia a quantidade.
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

// Valida os dados e envia a devolução para a API.
async function registrarDevolucao(evento) {
    evento.preventDefault();

    // Evita enviar o formulário novamente enquanto a requisição está em andamento.
    if (salvando) return;

    setErro("");

    if (!emprestimoSelecionado) {
        setErro("Selecione um empréstimo.");
        return;
    }

    const quantidade = Number(formulario.quantidade_devolvida);
    const pendente = Number(emprestimoSelecionado.quantidade_pendente);

    // A quantidade precisa ser um número inteiro maior que zero.
    if (!Number.isInteger(quantidade) || quantidade < 1) {
        setErro("Informe uma quantidade inteira maior que zero.");
        return;
    }

    // Impede devolver uma quantidade maior que a pendente.
    if (quantidade > pendente) {
        setErro(
            `A quantidade máxima para este empréstimo é ${pendente}.`
        );
        return;
    }

    try {
        setSalvando(true);

        // Registra a devolução no banco por meio da API.
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

        // Após salvar, retorna à página de devoluções.
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
                {/* Título e descrição da página */}
                <div className="mb-4">
                    <h1 className="fw-bold mt-3 mb-2 text-black">
                        Nova devolução
                    </h1>

                    <p className="text-secondary mb-0">
                        Preencha os dados para registrar a devolução de equipamentos.
                    </p>
                </div>

                {/* Cartão principal do formulário */}
                <div
                    className="card border-0 shadow-sm"
                    style={{ borderRadius: "12px" }}
                >
                    <div className="card-body p-3 p-md-4">
                        <h2 className="h5 fw-bold mb-4 text-primary">
                            Dados da devolução
                        </h2>

                        {/* Exibe mensagens de erro */}
                        {erro && (
                            <div className="alert alert-danger" role="alert">
                                {erro}
                            </div>
                        )}

                        {/* Mostra o carregamento enquanto busca os dados */}
                        {carregando ? (
                            <div className="text-center py-5">
                                <div
                                    className="spinner-border text-primary"
                                    role="status"
                                >
                                    <span className="visually-hidden">
                                        Carregando...
                                    </span>
                                </div>

                                <p className="text-secondary mt-3 mb-0">
                                    Carregando empréstimos...
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={registrarDevolucao}>
                                <div className="row g-4">
                                    {/* Seleção do empréstimo */}
                                    <div className="col-12">
                                        <label
                                            htmlFor="emprestimo_id"
                                            className="form-label fw-semibold"
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

                                        {/* Mensagem quando não existem empréstimos pendentes */}
                                        {emprestimos.length === 0 && (
                                            <small className="text-secondary d-block mt-2">
                                                Não existem empréstimos pendentes de devolução.
                                            </small>
                                        )}
                                    </div>

                                    {/* Data em que a devolução está sendo registrada */}
                                    <div className="col-12 col-md-6">
                                        <label
                                            htmlFor="data_devolucao"
                                            className="form-label fw-semibold"
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

                                    {/* Quantidade de equipamentos devolvidos */}
                                    <div className="col-12 col-md-6">
                                        <label
                                            htmlFor="quantidade_devolvida"
                                            className="form-label fw-semibold"
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

                                        {/* Informa o limite de devolução */}
                                        {emprestimoSelecionado && (
                                            <small className="text-secondary d-block mt-2">
                                                Máximo permitido:{" "}
                                                {emprestimoSelecionado.quantidade_pendente}.
                                            </small>
                                        )}
                                    </div>
                                </div>

                                <hr className="my-4" />

                                {/* Botões de cancelar e registrar */}
                                <div className="d-flex flex-column flex-sm-row justify-content-end gap-2">
                                    <Link
                                        href="/devolucoes"
                                        className="btn btn-outline-secondary"
                                    >
                                        Cancelar
                                    </Link>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={
                                            salvando ||
                                            !emprestimoSelecionado ||
                                            emprestimos.length === 0
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
                                            "Registrar devolução"
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