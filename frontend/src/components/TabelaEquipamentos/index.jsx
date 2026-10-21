"use client";

import Link from "next/link";

export default function TabelaEquipamentos({
    equipamentos,
    obterStatus,
    onExcluir,
}) {
    return (
        <div className="table-responsive">
            <table className="table align-middle">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Tipo</th>
                        <th>Qtd. de equipamentos</th>
                        <th>Qtd. disponível</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>

                <tbody>
                    {equipamentos.length === 0 ? (
                        <tr>
                            <td
                                colSpan="7"
                                className="text-center text-secondary py-4"
                            >
                                Nenhum equipamento encontrado.
                            </td>
                        </tr>
                    ) : (
                        equipamentos.map((equipamento) => {
                            const status = obterStatus(equipamento);

                            return (
                                <tr key={equipamento.id}>
                                    <th
                                        scope="row"
                                        className="text-primary"
                                    >
                                        {equipamento.id}
                                    </th>

                                    <td>{equipamento.nome}</td>
                                    <td>{equipamento.categoria}</td>
                                    <td>
                                        {equipamento.maximo_equipamentos}
                                    </td>
                                    <td>{equipamento.qtd_disponivel}</td>

                                    <td>
                                        <span
                                            className={`badge ${status.classe}`}
                                        >
                                            {status.texto}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="d-flex gap-2">
                                            <Link
                                                href={`/equipamentos/editar/${equipamento.id}`}
                                                className="btn btn-primary btn-sm"
                                            >
                                                Editar
                                            </Link>

                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    onExcluir(equipamento)
                                                }
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}