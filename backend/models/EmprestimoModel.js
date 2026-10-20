
export function criarEmprestimoModel({ pool }) {
    const statusPermitidos = [
        "Em andamento",
        "Devolvido",
        "Atrasado"
    ];

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

    function validarDados(emprestimo) {
        const funcionarioId = Number(emprestimo.funcionario_id);
        const equipamentoId = Number(emprestimo.equipamento_id);
        const quantidade = Number(emprestimo.qtd_emprestimo);

        if (
            !Number.isInteger(funcionarioId) || funcionarioId <= 0 ||
            !Number.isInteger(equipamentoId) || equipamentoId <= 0
        ) {
            throw new Error("Funcionário ou equipamento inválido.");
        }

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            throw new Error("A quantidade deve ser maior que zero.");
        }

        if (
            !validarData(emprestimo.data_emprestimo) ||
            !validarData(emprestimo.data_prevista_devolucao)
        ) {
            throw new Error(
                "Informe datas válidas no formato YYYY-MM-DD."
            );
        }

        if (
            emprestimo.data_prevista_devolucao <
            emprestimo.data_emprestimo
        ) {
            throw new Error(
                "A data prevista não pode ser anterior à data do empréstimo."
            );
        }

        return {
            funcionarioId,
            equipamentoId,
            quantidade
        };
    }

    async function listarTodos() {
        const [resultado] = await pool.query(`
            SELECT
                e.id AS emprestimo_id,
                e.data_emprestimo,
                e.data_prevista_devolucao,
                e.qtd_emprestimo,
                e.status,
                CASE
                    WHEN e.status = 'Em andamento'
                         AND e.data_prevista_devolucao < CURDATE()
                    THEN 'Atrasado'
                    ELSE e.status
                END AS status_atual,
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
        const [linhas] = await pool.execute(`
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
        `, [id]);

        return linhas.length === 0 ? null : linhas[0];
    }

    async function criar(emprestimo) {
        const {
            funcionarioId,
            equipamentoId,
            quantidade
        } = validarDados(emprestimo);

        const {
            data_emprestimo,
            data_prevista_devolucao
        } = emprestimo;

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

            const disponivel = Number(
                equipamentos[0].qtd_disponivel
            );

            if (disponivel < quantidade) {
                throw new Error(
                    "Não há quantidade disponível suficiente."
                );
            }

            // Desconta o estoque automaticamente.
            await conexao.execute(
                `UPDATE equipamentos
                 SET qtd_disponivel = qtd_disponivel - ?
                 WHERE id = ?`,
                [quantidade, equipamentoId]
            );

            // Registra o empréstimo.
            const [resultado] = await conexao.execute(
                `INSERT INTO emprestimos (
                    funcionario_id,
                    equipamento_id,
                    data_emprestimo,
                    data_prevista_devolucao,
                    qtd_emprestimo,
                    status
                ) VALUES (?, ?, ?, ?, ?, 'Em andamento')`,
                [
                    funcionarioId,
                    equipamentoId,
                    data_emprestimo,
                    data_prevista_devolucao,
                    quantidade
                ]
            );

            await conexao.commit();

            return buscarPorId(resultado.insertId);

        } catch (erro) {
            await conexao.rollback();
            throw erro;
        } finally {
            conexao.release();
        }
    }

    async function atualizar(id, emprestimo) {
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
                throw new Error("Empréstimo não encontrado.");
            }

            const atual = linhas[0];

            const novoStatus = emprestimo.status ?? atual.status;

            if (!statusPermitidos.includes(novoStatus)) {
                throw new Error("Status inválido.");
            }

            const [devolucoes] = await conexao.execute(
                `SELECT id
                 FROM devolucoes
                 WHERE emprestimo_id = ?
                 LIMIT 1`,
                [id]
            );

            // Se já houve devolução, permite alterar somente o status.
            // Não permite modificar a quantidade, o equipamento,
            // o funcionário ou as datas, pois isso poderia
            // deixar o estoque e o histórico inconsistentes.
            if (devolucoes.length > 0) {
                const camposRecebidos = [
                    "funcionario_id",
                    "equipamento_id",
                    "data_emprestimo",
                    "data_prevista_devolucao",
                    "qtd_emprestimo"
                ];

                const houveAlteracaoDosDados = camposRecebidos.some(
                    campo => {
                        if (emprestimo[campo] === undefined) {
                            return false;
                        }

                        if (
                            campo === "funcionario_id" ||
                            campo === "equipamento_id" ||
                            campo === "qtd_emprestimo"
                        ) {
                            return Number(emprestimo[campo]) !==
                                Number(
                                    campo === "funcionario_id"
                                        ? atual.funcionario_id
                                        : campo === "equipamento_id"
                                            ? atual.equipamento_id
                                            : atual.qtd_emprestimo
                                );
                        }

                        const valorAtual = atual[campo] instanceof Date
                            ? atual[campo].toISOString().slice(0, 10)
                            : String(atual[campo]).slice(0, 10);

                        return String(emprestimo[campo]).slice(0, 10)
                            !== valorAtual;
                    }
                );

                if (houveAlteracaoDosDados) {
                    throw new Error(
                        "Este empréstimo possui devoluções. " +
                        "Somente o status pode ser alterado."
                    );
                }

                await conexao.execute(
                    `UPDATE emprestimos
                     SET status = ?
                     WHERE id = ?`,
                    [novoStatus, id]
                );

                await conexao.commit();

                return buscarPorId(id);
            }

            const {
                funcionarioId,
                equipamentoId,
                quantidade
            } = validarDados(emprestimo);

            const {
                data_emprestimo,
                data_prevista_devolucao
            } = emprestimo;

            const [funcionarios] = await conexao.execute(
                "SELECT id FROM funcionarios WHERE id = ?",
                [funcionarioId]
            );

            if (funcionarios.length === 0) {
                throw new Error("Funcionário não encontrado.");
            }

            // Bloqueia os equipamentos por ordem de ID.
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

            const equipamentoAntigoId = Number(
                atual.equipamento_id
            );

            const quantidadeAntiga = Number(
                atual.qtd_emprestimo
            );

            const disponivelDestino =
                Number(equipamentos[equipamentoId].qtd_disponivel) +
                (
                    equipamentoId === equipamentoAntigoId
                        ? quantidadeAntiga
                        : 0
                );

            if (disponivelDestino < quantidade) {
                throw new Error(
                    "Não há quantidade disponível suficiente " +
                    "para a alteração."
                );
            }

            // Repõe a quantidade antiga.
            await conexao.execute(
                `UPDATE equipamentos
                 SET qtd_disponivel = qtd_disponivel + ?
                 WHERE id = ?`,
                [quantidadeAntiga, equipamentoAntigoId]
            );

            // Desconta a nova quantidade.
            await conexao.execute(
                `UPDATE equipamentos
                 SET qtd_disponivel = qtd_disponivel - ?
                 WHERE id = ?`,
                [quantidade, equipamentoId]
            );

            // Atualiza os dados e o status.
            await conexao.execute(
                `UPDATE emprestimos
                 SET funcionario_id = ?,
                     equipamento_id = ?,
                     data_emprestimo = ?,
                     data_prevista_devolucao = ?,
                     qtd_emprestimo = ?,
                     status = ?
                 WHERE id = ?`,
                [
                    funcionarioId,
                    equipamentoId,
                    data_emprestimo,
                    data_prevista_devolucao,
                    quantidade,
                    novoStatus,
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
                throw new Error("Empréstimo não encontrado.");
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
                    "Não é possível excluir um empréstimo " +
                    "que possui devoluções registradas."
                );
            }

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

            // Libera as unidades emprestadas.
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
