
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BarraNavegacao from "@/components/BarraNavegacao";

export default function NovoEquipamento() {
    const router = useRouter();

    const [formulario, setFormulario] = useState({
        nome: "",
        categoria: "",
        qtd_equipamentos: ""
    });

    const [erro, setErro] = useState("");
    const [salvando, setSalvando] = useState(false);

    function alterarCampo(e) {
        const { name, value } = e.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value
        }));
    }

    async function cadastrarEquipamento(e) {
        e.preventDefault();
        setErro("");

        // Validar somente os três campos do formulário
        if (
            !formulario.nome.trim() ||
            !formulario.categoria.trim() ||
            formulario.qtd_equipamentos === ""
        ) {
            setErro("Preencha todos os campos.");
            return;
        }

        const quantidadeMaxima = Number(formulario.qtd_equipamentos);

        if (!Number.isInteger(quantidadeMaxima) || quantidadeMaxima <= 0) {
            setErro("A quantidade máxima deve ser um número inteiro maior que zero.");
            return;
        }

        try {
            setSalvando(true);

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
                        qtd_equipamentos: quantidadeMaxima,
                        qtd_disponivel: quantidadeMaxima
                    })
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.mensagem ||
                    resultado.erro ||
                    "Não foi possível cadastrar o equipamento."
                );
            }

            router.push("/equipamentos");
            router.refresh();
        } catch (erro) {
            console.error("Erro ao cadastrar equipamento:", erro);
            setErro(erro.message);
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="d-flex min-vh-100 bg-light">
            <BarraNavegacao />

            <main className="flex-grow-1 p-4">
                <div className="mb-4">
                    <Link
                        href="/equipamentos"
                        className="text-decoration-none"
                    >
                        ← Voltar para equipamentos
                    </Link>

                    <h2
                        className="fw-bold mt-3 mb-1"
                        style={{ color: "#142D52" }}
                    >
                        Registrar novo equipamento
                    </h2>

                    <p className="text-secondary">
                        Preencha os dados do equipamento de proteção individual.
                    </p>
                </div>

                <section className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                        <form onSubmit={cadastrarEquipamento}>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label
                                        htmlFor="nome"
                                        className="form-label fw-semibold"
                                    >
                                        Nome do equipamento
                                    </label>

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
                                    <label
                                        htmlFor="categoria"
                                        className="form-label fw-semibold"
                                    >
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
                                        htmlFor="qtd_equipamentos"
                                        className="form-label fw-semibold"
                                    >
                                        Quantidade máxima
                                    </label>

                                    <input
                                        id="qtd_equipamentos"
                                        name="qtd_equipamentos"
                                        type="number"
                                        className="form-control"
                                        placeholder="Ex.: 100"
                                        min="1"
                                        step="1"
                                        value={formulario.qtd_equipamentos}
                                        onChange={alterarCampo}
                                        required
                                    />

                                    <div className="form-text">
                                        A quantidade disponível começará igual à quantidade máxima.
                                    </div>
                                </div>
                            </div>

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