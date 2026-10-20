export function criarEmprestimoModel({ pool }) {

    async function listarTodos() {
        const [resultado] = await pool.query(`
            SELECT
                e.id AS emprestimo_id,
                e.data_emprestimo,
                e.data_prevista_devolucao,
                e.qtd_emprestimo,
                e.status,
                f.nome AS funcionario_nome,
                eq.nome AS equipamento_nome
            FROM emprestimos e
            INNER JOIN funcionarios f
                ON e.funcionario_id = f.id
            INNER JOIN equipamentos eq
                ON e.equipamento_id = eq.id
            ORDER BY e.id DESC
        `);
    
        return resultado;
    }

    async function buscarPorId(id) {
        const sql = `
            SELECT
                e.*,
                CASE
                    WHEN e.status = 'Em andamento'
                         AND e.data_prevista_devolucao < CURDATE()
                    THEN 'Atrasado'
                    ELSE e.status
                END AS status_atual
            FROM emprestimos e
            WHERE e.id = ?
        `;

        const [linhas] = await pool.query(sql, [id]);

        return linhas.length === 0 ? null : linhas[0];
    }

    async function criar(emprestimo) {
        const {
            funcionario_id,
            equipamento_id,
            data_emprestimo,
            data_prevista_devolucao,
            qtd_emprestimo
        } = emprestimo;

        const funcionarioId = Number(funcionario_id);
        const equipamentoId = Number(equipamento_id);
        const quantidade = Number(qtd_emprestimo);

        if (
            !Number.isInteger(funcionarioId) || funcionarioId <= 0 ||
            !Number.isInteger(equipamentoId) || equipamentoId <= 0
        ) {
            throw new Error("Funcionário ou equipamento inválido.");
        }

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            throw new Error("A quantidade deve ser maior que zero.");
        }

        function validarData(data) {
            if (
                typeof data !== "string" ||
                !/^\d{4}-\d{2}-\d{2}$/.test(data)
            ) {
                return false;
            }

            const [ano, mes, dia] = data.split("-").map(Number);
            const teste = new Date(Date.UTC(ano, mes - 1, dia));

            return (
                teste.getUTCFullYear() === ano &&
                teste.getUTCMonth() === mes - 1 &&
                teste.getUTCDate() === dia
            );
        }

        if (
            !validarData(data_emprestimo) ||
            !validarData(data_prevista_devolucao)
        ) {
            throw new Error("Informe datas válidas no formato YYYY-MM-DD.");
        }

        if (data_prevista_devolucao < data_emprestimo) {
            throw new Error(
                "A data prevista não pode ser anterior à data do empréstimo."
            );
        }

        const conexao = await pool.getConnection();

        try {
            await conexao.beginTransaction();

            const [funcionarios] = await conexao.execute(
                "SELECT id FROM funcionarios WHERE id = ?",
                [funcionarioId]
            );

            if (funcionarios.length === 0) {
                throw new Error("Funcionário não encontrado.");
            }

            const [equipamentos] = await conexao.execute(
                `SELECT id, qtd_disponivel
                 FROM equipamentos
                 WHERE id = ?
                 FOR UPDATE`,
                [equipamentoId]
            );

            if (equipamentos.length === 0) {
                throw new Error("Equipamento não encontrado.");
            }

            if (equipamentos[0].qtd_disponivel < quantidade) {
                throw new Error(
                    "Não há quantidade disponível suficiente."
                );
            }

            await conexao.execute(
                `UPDATE equipamentos
                 SET qtd_disponivel = qtd_disponivel - ?
                 WHERE id = ?`,
                [quantidade, equipamentoId]
            );

            const [resultado] = await conexao.execute(
                `INSERT INTO emprestimos (
                    funcionario_id,
                    equipamento_id,
                    data_emprestimo,
                    data_prevista_devolucao,
                    qtd_emprestimo,
                    status
                )
                VALUES (?, ?, ?, ?, ?, 'Em andamento')`,
                [
                    funcionarioId,
                    equipamentoId,
                    data_emprestimo,
                    data_prevista_devolucao,
                    quantidade
                ]
            );

            await conexao.commit();

            return {
                id: resultado.insertId,
                funcionario_id: funcionarioId,
                equipamento_id: equipamentoId,
                data_emprestimo,
                data_prevista_devolucao,
                qtd_emprestimo: quantidade,
                status: "Em andamento"
            };

        } catch (erro) {
            await conexao.rollback();
            throw erro;
        } finally {
            conexao.release();
        }
    }

    async function atualizar(id, emprestimo) {
        const {
            funcionario_id,
            equipamento_id,
            data_emprestimo,
            data_prevista_devolucao,
            qtd_emprestimo
        } = emprestimo;

        const conexao = await pool.getConnection();

        try {
            await conexao.beginTransaction();

            const [linhas] = await conexao.execute(
                `SELECT *
                 FROM emprestimos
                 WHERE id = ?
                 FOR UPDATE`,
                [id]
            );

            if (linhas.length === 0) {
                await conexao.rollback();
                return null;
            }

            const atual = linhas[0];

            // Não altera empréstimos que já possuem devoluções
            const [devolucoes] = await conexao.execute(
                `SELECT id
                 FROM devolucoes
                 WHERE emprestimo_id = ?
                 LIMIT 1`,
                [id]
            );

            if (devolucoes.length > 0) {
                throw new Error(
                    "Não é possível editar um empréstimo com devoluções registradas."
                );
            }

            if (atual.status === "Devolvido") {
                throw new Error("O empréstimo já foi devolvido.");
            }

            const funcionarioId = Number(funcionario_id);
            const equipamentoId = Number(equipamento_id);
            const quantidade = Number(qtd_emprestimo);

            if (
                !Number.isInteger(funcionarioId) || funcionarioId <= 0 ||
                !Number.isInteger(equipamentoId) || equipamentoId <= 0
            ) {
                throw new Error("Funcionário ou equipamento inválido.");
            }

            if (!Number.isInteger(quantidade) || quantidade <= 0) {
                throw new Error("A quantidade deve ser maior que zero.");
            }

            function validarData(data) {
                if (
                    typeof data !== "string" ||
                    !/^\d{4}-\d{2}-\d{2}$/.test(data)
                ) {
                    return false;
                }

                const [ano, mes, dia] = data.split("-").map(Number);
                const teste = new Date(Date.UTC(ano, mes - 1, dia));

                return (
                    teste.getUTCFullYear() === ano &&
                    teste.getUTCMonth() === mes - 1 &&
                    teste.getUTCDate() === dia
                );
            }

            if (
                !validarData(data_emprestimo) ||
                !validarData(data_prevista_devolucao) ||
                data_prevista_devolucao < data_emprestimo
            ) {
                throw new Error("Informe datas válidas e coerentes.");
            }

            const [funcionarios] = await conexao.execute(
                "SELECT id FROM funcionarios WHERE id = ?",
                [funcionarioId]
            );

            if (funcionarios.length === 0) {
                throw new Error("Funcionário não encontrado.");
            }

            // Bloquear equipamentos em ordem de ID para evitar
            // problemas de concorrência ao trocar de equipamento
            const ids = [...new Set([
                Number(atual.equipamento_id),
                equipamentoId
            ])].sort((a, b) => a - b);

            const equipamentos = {};

            for (const equipamentoIdBloqueado of ids) {
                const [resultado] = await conexao.execute(
                    `SELECT id, qtd_disponivel
                     FROM equipamentos
                     WHERE id = ?
                     FOR UPDATE`,
                    [equipamentoIdBloqueado]
                );

                if (resultado.length === 0) {
                    throw new Error("Equipamento não encontrado.");
                }

                equipamentos[equipamentoIdBloqueado] = resultado[0];
            }

            // Repor o estoque do empréstimo antigo dentro da transação
            await conexao.execute(
                `UPDATE equipamentos
                 SET qtd_disponivel = qtd_disponivel + ?
                 WHERE id = ?`,
                [atual.qtd_emprestimo, atual.equipamento_id]
            );

            const disponivelDestino =
                Number(equipamentos[equipamentoId].qtd_disponivel) +
                (equipamentoId === Number(atual.equipamento_id)
                    ? Number(atual.qtd_emprestimo)
                    : 0);

            if (disponivelDestino < quantidade) {
                throw new Error(
                    "Não há quantidade disponível suficiente para a alteração."
                );
            }

            // Reservar a nova quantidade
            await conexao.execute(
                `UPDATE equipamentos
                 SET qtd_disponivel = qtd_disponivel - ?
                 WHERE id = ?`,
                [quantidade, equipamentoId]
            );

            await conexao.execute(
                `UPDATE emprestimos
                 SET funcionario_id = ?,
                     equipamento_id = ?,
                     data_emprestimo = ?,
                     data_prevista_devolucao = ?,
                     qtd_emprestimo = ?
                 WHERE id = ?`,
                [
                    funcionarioId,
                    equipamentoId,
                    data_emprestimo,
                    data_prevista_devolucao,
                    quantidade,
                    id
                ]
            );

            await conexao.commit();

            return buscarPorId(id);

        } catch (erro) {
            await conexao.rollback();
            throw erro;
        } finally {
            conexao.release();
        }
    }

    async function deletarPorId(id) {
        const conexao = await pool.getConnection();

        try {
            await conexao.beginTransaction();

            const [linhas] = await conexao.execute(
                `SELECT *
                 FROM emprestimos
                 WHERE id = ?
                 FOR UPDATE`,
                [id]
            );

            if (linhas.length === 0) {
                await conexao.rollback();
                return false;
            }

            const emprestimo = linhas[0];

            const [devolucoes] = await conexao.execute(
                `SELECT id
                 FROM devolucoes
                 WHERE emprestimo_id = ?
                 LIMIT 1`,
                [id]
            );

            if (devolucoes.length > 0) {
                throw new Error(
                    "Não é possível excluir um empréstimo que possui devoluções registradas."
                );
            }

            // Bloquear o equipamento antes de repor a quantidade
            const [equipamentos] = await conexao.execute(
                `SELECT id
                 FROM equipamentos
                 WHERE id = ?
                 FOR UPDATE`,
                [emprestimo.equipamento_id]
            );

            if (equipamentos.length === 0) {
                throw new Error("Equipamento não encontrado.");
            }

            // Liberar as unidades que estavam emprestadas
            await conexao.execute(
                `UPDATE equipamentos
                 SET qtd_disponivel = qtd_disponivel + ?
                 WHERE id = ?`,
                [
                    emprestimo.qtd_emprestimo,
                    emprestimo.equipamento_id
                ]
            );

            await conexao.execute(
                "DELETE FROM emprestimos WHERE id = ?",
                [id]
            );

            await conexao.commit();

            return true;

        } catch (erro) {
            await conexao.rollback();
            throw erro;
        } finally {
            conexao.release();
        }
    }

    return {
        listarTodos,
        buscarPorId,
        criar,
        atualizar,
        deletarPorId
    };
}