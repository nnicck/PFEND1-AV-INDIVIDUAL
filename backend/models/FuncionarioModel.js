// pool = conexões do MySQL
export function criarFuncionarioModel({ pool }) {

    async function listarTodos() {
        const [linhas] = await pool.query("SELECT * FROM funcionarios");
        return linhas;
    }

    async function buscarPorId(id) {
        const [linhas] = await pool.query(
            "SELECT * FROM funcionarios WHERE id = ?",
            [id]
        );

        if (linhas.length === 0) {
            return null;
        }

        return linhas[0];
    }

    async function criar(funcionario) {
        const sql = `
            INSERT INTO funcionarios (
                nome, cargo, status_funcionario, setor
            )
            VALUES (?, ?, ?, ?)
        `;

        const valores = [
            funcionario.nome,
            funcionario.cargo,
            funcionario.status_funcionario,
            funcionario.setor
        ];

        const [resultado] = await pool.query(sql, valores);

        return {
            ...funcionario,
            id: resultado.insertId
        };
    }

    async function deletarPorId(id) {
        const [resultado] = await pool.query(
            "DELETE FROM funcionarios WHERE id = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return null;
        }

        return true;
    }

    async function atualizar(id, funcionario) {
        const sql = `
            UPDATE funcionarios
            SET nome = ?, cargo = ?, status_funcionario = ?, setor = ?
            WHERE id = ?
        `;

        const valores = [
            funcionario.nome,
            funcionario.cargo,
            funcionario.status_funcionario,
            funcionario.setor,
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
            ...funcionario,
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