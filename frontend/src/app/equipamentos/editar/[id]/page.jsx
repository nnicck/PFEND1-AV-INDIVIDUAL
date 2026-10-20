"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import BarraNavegacao from "@/components/BarraNavegacao";

const API = "http://localhost:3001/api";

export default function EditarEquipamento() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [formulario, setFormulario] = useState({
        nome: "",
        categoria: "",
        fabricante: "",
        maximo_equipamentos: "",
        qtd_disponivel: ""
    });

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregarEquipamento() {
            try {
                const resposta = await fetch(`${API}/equipamentos/${id}`);

                if (!resposta.ok) {
                    throw new Error("Não foi possível carregar o equipamento.");
                }

                const resultado = await resposta.json();
                const equipamento = resultado.dados ?? resultado;

                setFormulario({
                    nome: equipamento.nome ?? "",
                    categoria: equipamento.categoria ?? "",
                    fabricante: equipamento.fabricante ?? "",
                    maximo_equipamentos: String(
                        equipamento.maximo_equipamentos ?? ""
                    ),
                    qtd_disponivel: String(
                        equipamento.qtd_disponivel ?? ""
                    )
                });
            } catch (error) {
                console.error("Erro ao carregar equipamento:", error);
                setErro(error.message);
            } finally {
                setCarregando(false);
            }
        }

        if (id) {
            carregarEquipamento();
        }
    }, [id]);

    function alterarCampo(e) {
        const { name, value } = e.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value
        }));

        setErro("");
    }

    async function atualizarEquipamento(e) {
        e.preventDefault();
        setErro("");

        const total = Number(formulario.maximo_equipamentos);
        const disponivel = Number(formulario.qtd_disponivel);

        if (
            !formulario.nome.trim() ||
            !formulario.categoria.trim() ||
            !formulario.fabricante.trim() ||
            formulario.maximo_equipamentos === ""
        ) {
            setErro("Preencha todos os campos.");
            return;
        }

        if (!Number.isInteger(total) || total < 0) {
            setErro("A quantidade máxima deve ser um número inteiro maior ou igual a zero.");
            return;
        }

        if (
            !Number.isInteger(disponivel) ||
            disponivel < 0 ||
            disponivel > total
        ) {
            setErro("A quantidade disponível deve estar entre zero e a quantidade máxima.");
            return;
        }

        try {
            setSalvando(true);

            const resposta = await fetch(`${API}/equipamentos/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome: formulario.nome.trim(),
                    categoria: formulario.categoria.trim(),
                    fabricante: formulario.fabricante.trim(),
                    maximo_equipamentos: total,
                    qtd_disponivel: disponivel
                })
            });

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.mensagem ||
                    resultado.erro ||
                    "Não foi possível atualizar o equipamento."
                );
            }

            router.push("/equipamentos");
            router.refresh();
        } catch (error) {
            console.error("Erro ao atualizar equipamento:", error);
            setErro(error.message);
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
                        Editar equipamento
                    </h2>

                    <p className="text-secondary">
                        Atualize os dados do equipamento cadastrado.
                    </p>
                </div>

                {carregando ? (
                    <p className="text-secondary">
                        Carregando equipamento...
                    </p>
                ) : (
                    <section className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <form onSubmit={atualizarEquipamento}>
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
                                            value={formulario.nome}
                                            onChange={alterarCampo}
                                            maxLength={100}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
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
                                            value={formulario.categoria}
                                            onChange={alterarCampo}
                                            maxLength={100}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label
                                            htmlFor="fabricante"
                                            className="form-label fw-semibold"
                                        >
                                            Fabricante
                                        </label>

                                        <input
                                            id="fabricante"
                                            name="fabricante"
                                            type="text"
                                            className="form-control"
                                            value={formulario.fabricante}
                                            onChange={alterarCampo}
                                            maxLength={100}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
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
                                            min="0"
                                            step="1"
                                            value={formulario.maximo_equipamentos}
                                            onChange={alterarCampo}
                                            required
                                        />

                                        <div className="form-text">
                                            Não pode ser menor que a quantidade já emprestada.
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <label
                                            htmlFor="qtd_disponivel"
                                            className="form-label fw-semibold"
                                        >
                                            Quantidade disponível
                                        </label>

                                        <input
                                            id="qtd_disponivel"
                                            name="qtd_disponivel"
                                            type="number"
                                            className="form-control"
                                            min="0"
                                            max={formulario.maximo_equipamentos}
                                            step="1"
                                            value={formulario.qtd_disponivel}
                                            onChange={alterarCampo}
                                            readOnly
                                        />

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