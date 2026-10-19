// pool = conexões do MySQL
export function criarDevolucaoModel({ pool }) {

    async function listarTodos() {
        const [linhas] = await pool.query("SELECT * FROM devolucoes");
        return linhas;
    }

    async function buscarPorId(id) {
        const [linhas] = await pool.query(
            "SELECT * FROM devolucoes WHERE id = ?",
            [id]
        );

        if (linhas.length === 0) {
            return null;
        }

        return linhas[0];
    }

    async function criar(devolucao) {
        const sql = `
            INSERT INTO devolucoes (
                emprestimo_id,
                data_devolucao,
                quantidade_devolvida,
                condicao
            )
            VALUES (?, ?, ?, ?)
        `;

        const valores = [
            devolucao.emprestimo_id,
            devolucao.data_devolucao,
            devolucao.quantidade_devolvida,
            devolucao.condicao
        ];

        const [resultado] = await pool.query(sql, valores);

        return {
            ...devolucao,
            id: resultado.insertId
        };
    }

    async function deletarPorId(id) {
        const [resultado] = await pool.query(
            "DELETE FROM devolucoes WHERE id = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return null;
        }

        return true;
    }

    async function atualizar(id, devolucao) {
        const sql = `
            UPDATE devolucoes
            SET emprestimo_id = ?,
                data_devolucao = ?,
                quantidade_devolvida = ?,
                condicao = ?
            WHERE id = ?
        `;

        const valores = [
            devolucao.emprestimo_id,
            devolucao.data_devolucao,
            devolucao.quantidade_devolvida,
            devolucao.condicao,
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
            ...devolucao,
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