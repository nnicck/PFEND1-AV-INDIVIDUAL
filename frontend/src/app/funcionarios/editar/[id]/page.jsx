"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import BarraNavegacao from "@/components/BarraNavegacao";

const API = "http://localhost:3001/api";

export default function EditarFuncionario() {
    const router = useRouter();
    const params = useParams();
    const id = params.id;

    const [formulario, setFormulario] = useState({
        nome: "",
        cargo: "",
        setor: "",
        status_funcionarios: "Ativo"
    });

    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    useEffect(() => {
        async function carregarFuncionario() {
            try {
                const resposta = await fetch(
                    `${API}/funcionarios/${id}`
                );

                if (!resposta.ok) {
                    throw new Error(
                        "Não foi possível carregar o funcionário."
                    );
                }

                const resultado = await resposta.json();
                const funcionario = resultado.dados ?? resultado;

                setFormulario({
                    nome: funcionario.nome ?? "",
                    cargo: funcionario.cargo ?? "",
                    setor: funcionario.setor ?? "",
                    status_funcionarios:
                        funcionario.status_funcionarios ?? "Ativo"
                });
            } catch (error) {
                console.error("Erro ao carregar funcionário:", error);
                setErro(error.message);
            } finally {
                setCarregando(false);
            }
        }

        if (id) {
            carregarFuncionario();
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

    async function atualizarFuncionario(e) {
        e.preventDefault();
        setErro("");

        if (
            !formulario.nome.trim() ||
            !formulario.cargo.trim() ||
            !formulario.setor.trim() ||
            !formulario.status_funcionarios
        ) {
            setErro("Preencha todos os campos.");
            return;
        }

        try {
            setSalvando(true);

            const resposta = await fetch(
                `${API}/funcionarios/${id}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nome: formulario.nome.trim(),
                        cargo: formulario.cargo.trim(),
                        setor: formulario.setor.trim(),
                        status_funcionarios:
                            formulario.status_funcionarios
                    })
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.mensagem ||
                    resultado.erro ||
                    "Não foi possível atualizar o funcionário."
                );
            }

            router.push("/funcionarios");
            router.refresh();
        } catch (error) {
            console.error("Erro ao atualizar funcionário:", error);
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
                        href="/funcionarios"
                        className="text-decoration-none"
                    >
                        ← Voltar para funcionários
                    </Link>

                    <h2
                        className="fw-bold mt-3 mb-1"
                        style={{ color: "#142D52" }}
                    >
                        Editar funcionário
                    </h2>

                    <p className="text-secondary">
                        Atualize os dados do funcionário cadastrado.
                    </p>
                </div>

                {carregando ? (
                    <p className="text-secondary">
                        Carregando funcionário...
                    </p>
                ) : (
                    <section className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <form onSubmit={atualizarFuncionario}>
                                <div className="row g-3">
                                    <div className="col-12">
                                        <label
                                            htmlFor="nome"
                                            className="form-label fw-semibold"
                                        >
                                            Nome completo
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
                                            htmlFor="cargo"
                                            className="form-label fw-semibold"
                                        >
                                            Cargo
                                        </label>

                                        <input
                                            id="cargo"
                                            name="cargo"
                                            type="text"
                                            className="form-control"
                                            value={formulario.cargo}
                                            onChange={alterarCampo}
                                            maxLength={100}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label
                                            htmlFor="setor"
                                            className="form-label fw-semibold"
                                        >
                                            Setor
                                        </label>

                                        <input
                                            id="setor"
                                            name="setor"
                                            type="text"
                                            className="form-control"
                                            value={formulario.setor}
                                            onChange={alterarCampo}
                                            maxLength={100}
                                            required
                                        />
                                    </div>

                                    <div className="col-md-6">
                                        <label
                                            htmlFor="status_funcionarios"
                                            className="form-label fw-semibold"
                                        >
                                            Status
                                        </label>

                                        <select
                                            id="status_funcionarios"
                                            name="status_funcionarios"
                                            className="form-select"
                                            value={
                                                formulario.status_funcionarios
                                            }
                                            onChange={alterarCampo}
                                            required
                                        >
                                            <option value="Ativo">
                                                Ativo
                                            </option>

                                            <option value="Inativo">
                                                Inativo
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                {erro && (
                                    <div className="alert alert-danger mt-4 mb-0">
                                        {erro}
                                    </div>
                                )}

                                <div className="d-flex justify-content-end gap-2 mt-4">
                                    <Link
                                        href="/funcionarios"
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