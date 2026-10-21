import Link from "next/link";

export default function TabelaFuncionarios({
    funcionarios,
    obterStatus,
    onExcluir,
}) {
    // Ordena os funcionários pelo ID em ordem crescente.
    const funcionariosOrdenados = [...funcionarios].sort(
        (a, b) => Number(a.id) - Number(b.id)
    );

    return (
        <div className="table-responsive">
            <table className="table align-middle">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Cargo</th>
                        <th>Setor</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>

                <tbody>
                    {funcionariosOrdenados.length === 0 ? (
                        <tr>
                            <td
                                colSpan={6}
                                className="text-center text-secondary py-4"
                            >
                                Nenhum funcionário encontrado.
                            </td>
                        </tr>
                    ) : (
                        funcionariosOrdenados.map((funcionario) => {
                            const status = obterStatus(funcionario);

                            return (
                                <tr key={funcionario.id}>
                                    <td className="fw-semibold text-primary">
                                        {funcionario.id}
                                    </td>

                                    <td>{funcionario.nome}</td>
                                    <td>{funcionario.cargo || "-"}</td>
                                    <td>{funcionario.setor || "-"}</td>

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
                                                href={`/funcionarios/editar/${funcionario.id}`}
                                                className="btn btn-primary btn-sm"
                                            >
                                                Editar
                                            </Link>

                                            <button
                                                type="button"
                                                className="btn btn-danger btn-sm"
                                                onClick={() =>
                                                    onExcluir(funcionario)
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