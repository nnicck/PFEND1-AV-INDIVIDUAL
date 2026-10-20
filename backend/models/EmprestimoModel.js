// pool = conexões do MySQL
export function criarEmprestimoModel({ pool }) {

    //Dando Join para juntas todas as tabelas para cada registro
    async function listarTodos() {
        const sql = `
            SELECT
                e.id AS emprestimo_id, 
                e.funcionario_id,
                e.equipamento_id,
                f.nome AS funcionario_nome,
                f.cargo,
                f.setor,
                eq.nome AS equipamento_nome,
                eq.categoria,
                e.data_emprestimo,
                e.data_prevista_devolucao,
                e.qtd_emprestimo,
                e.status,
                d.data_devolucao,
                d.quantidade_devolvida,
                d.condicao
            FROM emprestimos e
            INNER JOIN funcionarios f
                ON e.funcionario_id = f.id
            INNER JOIN equipamentos eq
                ON e.equipamento_id = eq.id
            LEFT JOIN devolucoes d
                ON e.id = d.emprestimo_id
        `;

        const [linhas] = await pool.query(sql);

        return linhas;
    }

    async function buscarPorId(id) {
        const [linhas] = await pool.query(
            "SELECT * FROM emprestimos WHERE id = ?",
            [id]
        );

        if (linhas.length === 0) {
            return null;
        }

        return linhas[0];
    }

    async function criar(emprestimo) {
        const sql = `
            INSERT INTO emprestimos (
                funcionario_id,
                equipamento_id,
                data_emprestimo,
                data_prevista_devolucao,
                qtd_emprestimo,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const valores = [
            emprestimo.funcionario_id,
            emprestimo.equipamento_id,
            emprestimo.data_emprestimo,
            emprestimo.data_prevista_devolucao,
            emprestimo.qtd_emprestimo,
            emprestimo.status
        ];

        const [resultado] = await pool.query(sql, valores);

        return {
            ...emprestimo,
            id: resultado.insertId
        };
    }

    async function deletarPorId(id) {
        const [resultado] = await pool.query(
            "DELETE FROM emprestimos WHERE id = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return null;
        }

        return true;
    }

    async function atualizar(id, emprestimo) {
        const sql = `
            UPDATE emprestimos
            SET funcionario_id = ?,
                equipamento_id = ?,
                data_emprestimo = ?,
                data_prevista_devolucao = ?,
                qtd_emprestimo = ?,
                status = ?
            WHERE id = ?
        `;

        const valores = [
            emprestimo.funcionario_id,
            emprestimo.equipamento_id,
            emprestimo.data_emprestimo,
            emprestimo.data_prevista_devolucao,
            emprestimo.qtd_emprestimo,
            emprestimo.status,
            id
        ];

        const [resultado] = await pool.query(sql, valores);

        if (resultado.affectedRows === 0) {
            const existente = await buscarPorId(id);

            if (!existente) {
                return null;
            }
        }

        return {
            ...emprestimo,
            id: Number(id)
        };
    }

    return {
        listarTodos,
        buscarPorId,
        criar,
        deletarPorId,
        atualizar
    };
}