// pool = conexões do MySQL
export function criarEquipamentoModel({ pool }) {

    async function listarTodos() {
        const [linhas] = await pool.query("SELECT * FROM equipamentos");
        return linhas;
    }

    async function buscarPorId(id) {
        const [linhas] = await pool.query(
            "SELECT * FROM equipamentos WHERE id = ?",
            [id]
        );

        if (linhas.length === 0) {
            return null;
        }

        return linhas[0];
    }

    async function criar(equipamento) {
        const sql = `
            INSERT INTO equipamentos (
                nome, categoria, qtd_equipamentos, qtd_disponivel
            )
            VALUES (?, ?, ?, ?)
        `;

        const valores = [
            equipamento.nome,
            equipamento.categoria,
            equipamento.qtd_equipamentos,
            equipamento.qtd_disponivel
        ];

        const [resultado] = await pool.query(sql, valores);

        return {
            ...equipamento,
            id: resultado.insertId
        };
    }

    async function deletarPorId(id) {
        const [resultado] = await pool.query(
            "DELETE FROM equipamentos WHERE id = ?",
            [id]
        );

        if (resultado.affectedRows === 0) {
            return null;
        }

        return true;
    }

    async function atualizar(id, equipamento) {
        const sql = `
            UPDATE equipamentos
            SET nome = ?, categoria = ?, qtd_equipamentos = ?,
                qtd_disponivel = ?
            WHERE id = ?
        `;

        const valores = [
            equipamento.nome,
            equipamento.categoria,
            equipamento.qtd_equipamentos,
            equipamento.qtd_disponivel,
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
            ...equipamento,
            id: Number(id)
        };
    }

    return { listarTodos, buscarPorId, criar, deletarPorId, atualizar };
}