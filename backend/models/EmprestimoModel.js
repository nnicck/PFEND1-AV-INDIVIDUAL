// pool = conexões do MySQL
export function criarEmprestimoModel({ pool }) {

    async function listarTodos() {
        const [linhas] = await pool.query("SELECT * FROM emprestimos");
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