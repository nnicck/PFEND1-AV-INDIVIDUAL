
export function criarFuncionarioModel({ pool }) {

    async function listarTodos() {
        const [linhas] = await pool.query(
            "SELECT * FROM funcionarios ORDER BY id DESC"
        );

        return linhas;
    }

    async function buscarPorId(id) {
        const [linhas] = await pool.query(
            "SELECT * FROM funcionarios WHERE id = ?",
            [id]
        );

        return linhas.length === 0 ? null : linhas[0];
    }

    async function criar(funcionario) {
        const { nome, cargo, setor, status_funcionarios } = funcionario;

        if (!nome || !nome.trim()) {
            throw new Error("O nome do funcionário é obrigatório.");
        }

        const sql = `
            INSERT INTO funcionarios
                (nome, cargo, setor, status_funcionarios)
            VALUES (?, ?, ?, ?)
        `;

        const valores = [
            nome.trim(),
            cargo || null,
            setor || null,
            status_funcionarios || "Ativo"
        ];

        const [resultado] = await pool.query(sql, valores);

        return {
            id: resultado.insertId,
            nome: nome.trim(),
            cargo: cargo || null,
            setor: setor || null,
            status_funcionarios: status_funcionarios || "Ativo"
        };
    }

    async function atualizar(id, funcionario) {
        const { nome, cargo, setor, status_funcionarios } = funcionario;

        if (!nome || !nome.trim()) {
            throw new Error("O nome do funcionário é obrigatório.");
        }

        const sql = `
            UPDATE funcionarios
            SET nome = ?,
                cargo = ?,
                setor = ?,
                status_funcionarios = ?
            WHERE id = ?
        `;

        const valores = [
            nome.trim(),
            cargo || null,
            setor || null,
            status_funcionarios || "Ativo",
            id
        ];

        await pool.query(sql, valores);

        return buscarPorId(id);
    }

    async function deletarPorId(id) {
        const [resultado] = await pool.query(
            "DELETE FROM funcionarios WHERE id = ?",
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