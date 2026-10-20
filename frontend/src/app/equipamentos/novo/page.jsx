"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BarraNavegacao from "@/components/BarraNavegacao";

export default function NovoEquipamento() {
    const router = useRouter(); 
    //Basicamente redirecionar para uma nova página, depois de uma ação acontecer (cadastro)

    // Guarda os valores digitados nos campos do formulário.
    const [formulario, setFormulario] = useState({nome: "", categoria: "", maximo_equipamentos: ""});

    // Guarda uma mensagem de erro e controla o estado do botão de cadastro.
    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);

    // Atualiza somente o campo que o usuário alterou.
    function alterarCampo(e) {
        //Name é o nome do campo do input e value é o valor desse campo
        //e é o elemento que gerou esse evento (input)
        const { name, value } = e.target;

        //Estado anterior do campo
        setFormulario((anterior) => ({ ...anterior, [name]: value}));
    }

    async function cadastrarEquipamento(e) {
        // Impede que o formulário recarregue a página ao ser enviado.
        e.preventDefault();
        setErro("");

        // Verifica se todos os campos obrigatórios foram preenchidos.
        if (
            !formulario.nome.trim() ||
            !formulario.categoria.trim() ||
            formulario.maximo_equipamentos === ""
        ) {
            setErro("Preencha todos os campos.");
            return;
        }

        // Converte a quantidade digitada, que vem como texto, para número.
        const quantidadeMaxima = Number(
            formulario.maximo_equipamentos
        );

        // Aceita apenas números inteiros maiores que zero.
        if (
            !Number.isInteger(quantidadeMaxima) ||
            quantidadeMaxima <= 0
        ) {
            setErro(
                "A quantidade máxima deve ser um número inteiro maior que zero."
            );
            return;
        }

        try {
            // Desabilita o botão enquanto a requisição está sendo processada.
            setSalvando(true);

            // Envia os dados do equipamento para a API cadastrar no banco.
            const resposta = await fetch(
                "http://localhost:3001/api/equipamentos",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nome: formulario.nome.trim(),
                        categoria: formulario.categoria.trim(),
                        maximo_equipamentos: quantidadeMaxima,

                        // Inicialmente, todos os equipamentos estão disponíveis.
                        qtd_disponivel: quantidadeMaxima
                    })
                }
            );

            // Converte a resposta da API para um objeto JavaScript.
            const resultado = await resposta.json();

            // Se a API retornar erro, exibe a mensagem correspondente.
            if (!resposta.ok) {
                throw new Error(
                    resultado.mensagem ||
                    resultado.erro ||
                    "Não foi possível cadastrar o equipamento."
                );
            }

            // Após o cadastro, volta para a página de equipamentos
            // e solicita a atualização dos dados da página.
            router.push("/equipamentos");
            router.refresh();

        } catch (erro) {
            // Captura erros da requisição e mostra a mensagem na tela.
            console.error("Erro ao cadastrar equipamento:", erro);
            setErro(erro.message);

        } finally {
            // Libera o botão novamente, mesmo se ocorrer algum erro.
            setSalvando(false);
        }
    }

    return (
        <div className="d-flex min-vh-100 bg-light">
            <BarraNavegacao />

            <main className="flex-grow-1 p-4">
                <div className="mb-4">
                    <Link href="/equipamentos" className="text-decoration-none"> Voltar para equipamentos</Link>
                    <h2 className="fw-bold mt-3 mb-1" style={{ color: "#142D52" }}> Registrar novo equipamento</h2>

                    <p className="text-secondary">Preencha os dados do equipamento de proteção individual.</p>
                </div>

                <section className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                        <form onSubmit={cadastrarEquipamento}>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label fw-semibold"> Nome do equipamento </label>

                                    <input
                                        id="nome"
                                        name="nome"
                                        type="text"
                                        className="form-control"
                                        placeholder="Ex.: Capacete de segurança"
                                        value={formulario.nome}
                                        onChange={alterarCampo}
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label className="form-label fw-semibold">
                                        Tipo / Categoria
                                    </label>

                                    <input
                                        id="categoria"
                                        name="categoria"
                                        type="text"
                                        className="form-control"
                                        placeholder="Ex.: Proteção para cabeça"
                                        value={formulario.categoria}
                                        onChange={alterarCampo}
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label
                                        htmlFor="maximo_equipamentos"
                                        className="form-label fw-semibold"
                                    >
                                        Quantidade máxima
                                    </label>

                                    <input
                                        id="maximo_equipamentos"
                                        name="maximo_equipamentos"
                                        type="number"
                                        className="form-control"
                                        placeholder="Ex.: 100"
                                        min="1"
                                        step="1"
                                        value={formulario.maximo_equipamentos}
                                        onChange={alterarCampo}
                                        required
                                    />

                                    <div className="form-text">
                                        Ao cadastrar, a quantidade disponível
                                        começará igual à quantidade máxima.
                                    </div>
                                </div>
                            </div>

                            {/* Mostra o erro somente quando existir uma mensagem. */}
                            {erro && (
                                <div className="alert alert-danger mt-4 mb-0">
                                    {erro}
                                </div>
                            )}

                            <div className="d-flex justify-content-end gap-2 mt-4">
                                <Link
                                    href="/equipamentos"
                                    className="btn btn-outline-secondary"
                                >
                                    Cancelar
                                </Link>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={salvando}
                                >
                                    {/* Altera o texto enquanto o cadastro está sendo realizado. */}
                                    {salvando
                                        ? "Salvando..."
                                        : "Cadastrar equipamento"}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}