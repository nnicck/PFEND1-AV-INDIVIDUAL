"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BarraNavegacao from "@/components/BarraNavegacao";

export default function NovoFuncionario() {
    const router = useRouter();

    const [formulario, setFormulario] = useState({
        nome: "",
        cargo: "",
        setor: "",
        status_funcionarios: "Ativo"
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

    async function cadastrarFuncionario(e) {
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
                "http://localhost:3001/api/funcionarios",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        nome: formulario.nome.trim(),
                        cargo: formulario.cargo.trim(),
                        setor: formulario.setor.trim(),
                        status_funcionarios: formulario.status_funcionarios
                    })
                }
            );

            const resultado = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    resultado.mensagem ||
                    resultado.erro ||
                    "Não foi possível cadastrar o funcionário."
                );
            }

            router.push("/funcionarios");
            router.refresh();
        } catch (erro) {
            console.error("Erro ao cadastrar funcionário:", erro);
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
                        href="/funcionarios"
                        className="text-decoration-none"
                    >
                        ← Voltar para funcionários
                    </Link>

                    <h2
                        className="fw-bold mt-3 mb-1"
                        style={{ color: "#142D52" }}
                    >
                        Registrar novo funcionário
                    </h2>

                    <p className="text-secondary">
                        Preencha os dados do funcionário.
                    </p>
                </div>

                <section className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                        <form onSubmit={cadastrarFuncionario}>
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
                                        placeholder="Ex.: João da Silva"
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
                                        placeholder="Ex.: Técnico de segurança"
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
                                        placeholder="Ex.: Produção"
                                        value={formulario.setor}
                                        onChange={alterarCampo}
                                        maxLength={100}
                                        required
                                    />
                                </div>

                                <div className="col-12">
                                    <label
                                        htmlFor="status_funcionarios"
                                        className="form-label fw-semibold"
                                    >
                                        Status do funcionário
                                    </label>

                                    <select
                                        id="status_funcionarios"
                                        name="status_funcionarios"
                                        className="form-select"
                                        value={formulario.status_funcionarios}
                                        onChange={alterarCampo}
                                        required
                                    >
                                        <option value="Ativo">Ativo</option>
                                        <option value="Inativo">Inativo</option>
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
                                        : "Cadastrar funcionário"}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </main>
        </div>
    );
}