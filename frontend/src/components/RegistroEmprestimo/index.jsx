export default function RegistroEmprestimo({emprestimos}){
    return(
        <>
    {/* <tr>
        <th scope="row" className="text-primary">EMP-001</th>
        <td>14/10/2026</td>
        <td>João Silva</td>
        <td>Capacete de segurança</td>
        <td><span className="badge bg-success-subtle text-success">Em andamento</span></td>
        <td><button className="btn btn-outline-primary btn-sm">Detalhes</button></td>
    </tr> */}

        <tr>
            <th scope="row" className="text-primary">{emprestimos.id}</th>
            <td>{emprestimos.data_emprestimo}</td>
            <td>{emprestimos.funcionario_id}</td>
            <td>{emprestimos.equipamento_id}</td>
            <td>{emprestimos.status}</td>
            <td>
                <button className="btn btn-primary btn-sm">
                    Editar
                </button>
            </td>
        </tr>

    </>

    
    )
}