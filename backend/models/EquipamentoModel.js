export function criarEquipamentoModel({ pool }) {

    async function listarTodos() {
        const [linhas] = await pool.query(
            "SELECT * FROM equipamentos ORDER BY id DESC"
        );

        return linhas;
    }

    async function buscarPorId(id) {
        const [linhas] = await pool.query(
            "SELECT * FROM equipamentos WHERE id = ?",
            [id]
        );

        return linhas.length === 0 ? null : linhas[0];
    }

    async function criar(equipamento) {
        const {
            nome,
            categoria,
            fabricante,
            maximo_equipamentos
        } = equipamento;

        const total = Number(maximo_equipamentos);

        if (!nome || !nome.trim()) {
            throw new Error("O nome do equipamento é obrigatório.");
        }

        if (!Number.isInteger(total) || total < 0) {
            throw new Error("A quantidade total deve ser um inteiro não negativo.");
        }

        const sql = `
            INSERT INTO equipamentos (
                nome,
                categoria,
                fabricante,
                maximo_equipamentos,
                qtd_disponivel
            )
            VALUES (?, ?, ?, ?, ?)
        `;

        const valores = [
            nome.trim(),
            categoria || null,
            fabricante || null,
            total,
            total
        ];

        const [resultado] = await pool.query(sql, valores);

        return {
            id: resultado.insertId,
            nome: nome.trim(),
            categoria: categoria || null,
            fabricante: fabricante || null,
            maximo_equipamentos: total,
            qtd_disponivel: total
        };
    }

    async function atualizar(id, equipamento) {
        const { nome, categoria, fabricante, maximo_equipamentos } =
            equipamento;

        const total = Number(maximo_equipamentos);

        if (!nome || !nome.trim()) {
            throw new Error("O nome do equipamento é obrigatório.");
        }

        if (!Number.isInteger(total) || total < 0) {
            throw new Error("A quantidade total deve ser um inteiro não negativo.");
        }

        const conexao = await pool.getConnection();

        try {
            await conexao.beginTransaction();

            const [linhas] = await conexao.execute(
                `SELECT maximo_equipamentos, qtd_disponivel
                 FROM equipamentos
                 WHERE id = ?
                 FOR UPDATE`,
                [id]
            );

            if (linhas.length === 0) {
                await conexao.rollback();
                return null;
            }

            const atual = linhas[0];

            // Quantidade atualmente emprestada
            const emprestados =
                atual.maximo_equipamentos - atual.qtd_disponivel;

            if (total < emprestados) {
                throw new Error(
                    "A quantidade total não pode ser menor que a quantidade emprestada."
                );
            }

            // Preserva as unidades emprestadas
            const disponivel = total - emprestados;

            await conexao.execute(
                `UPDATE equipamentos
                 SET nome = ?,
                     categoria = ?,
                     fabricante = ?,
                     maximo_equipamentos = ?,
                     qtd_disponivel = ?
                 WHERE id = ?`,
                [
                    nome.trim(),
                    categoria || null,
                    fabricante || null,
                    total,
                    disponivel,
                    id
                ]
            );

            await conexao.commit();

            return {
                id: Number(id),
                nome: nome.trim(),
                categoria: categoria || null,
                fabricante: fabricante || null,
                maximo_equipamentos: total,
                qtd_disponivel: disponivel
            };

        } catch (erro) {
            await conexao.rollback();
            throw erro;
        } finally {
            conexao.release();
        }
    }

    async function deletarPorId(id) {
        const [resultado] = await pool.query(
            "DELETE FROM equipamentos WHERE id = ?",
            [id]
        );

        return resultado.affectedRows > 0;
    }

    return {
        listarTodos,
        buscarPorId,
        criar,
        atualizar,
        deletarPorId
    };
}