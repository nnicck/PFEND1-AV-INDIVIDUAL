export function criarDevolucaoModel({ pool }) {
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

    function formatarData(data) {
        return data instanceof Date
            ? data.toISOString().slice(0, 10)
            : String(data).slice(0, 10);
    }

    function validarDados(devolucao) {
        const quantidade = Number(devolucao.quantidade_devolvida);

        if (
            !Number.isInteger(Number(devolucao.emprestimo_id)) ||
            Number(devolucao.emprestimo_id) <= 0
        ) {
            throw new Error("Empréstimo inválido.");
        }

        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            throw new Error(
                "A quantidade devolvida deve ser um número inteiro maior que zero."
            );
        }

        if (!validarData(devolucao.data_devolucao)) {
            throw new Error("Informe uma data de devolução válida.");
        }


        return quantidade;
    }

    // Lista as devoluções com os nomes do funcionário e equipamento.
    async function listarTodos() {
        const sql = `
            SELECT
                d.id,
                d.emprestimo_id,
                d.data_devolucao,
                d.quantidade_devolvida,
                f.nome AS funcionario_nome,
                eq.nome AS equipamento_nome
            FROM devolucoes d
            INNER JOIN emprestimos e
                ON e.id = d.emprestimo_id
            INNER JOIN funcionarios f
                ON f.id = e.funcionario_id
            INNER JOIN equipamentos eq
                ON eq.id = e.equipamento_id
            ORDER BY d.id DESC
        `;

        const [linhas] = await pool.query(sql);
        return linhas;
    }

    async function buscarPorId(id) {
        const sql = `
            SELECT
                d.*,
                f.nome AS funcionario_nome,
                eq.nome AS equipamento_nome
            FROM devolucoes d
            INNER JOIN emprestimos e
                ON e.id = d.emprestimo_id
            INNER JOIN funcionarios f
                ON f.id = e.funcionario_id
            INNER JOIN equipamentos eq
                ON eq.id = e.equipamento_id
            WHERE d.id = ?
        `;

        const [linhas] = await pool.execute(sql, [id]);

        return linhas.length === 0 ? null : linhas[0];
    }

    async function bloquearEmprestimo(conexao, emprestimoId) {
        const [linhas] = await conexao.execute(
            `SELECT *
             FROM emprestimos
             WHERE id = ?
             FOR UPDATE`,
            [emprestimoId]
        );

        if (linhas.length === 0) {
            throw new Error("Empréstimo não encontrado.");
        }

        return linhas[0];
    }

    async function atualizarStatus(conexao, emprestimo) {
        const [somas] = await conexao.execute(
            `SELECT COALESCE(SUM(quantidade_devolvida), 0) AS total
             FROM devolucoes
             WHERE emprestimo_id = ?`,
            [emprestimo.id]
        );

        const totalDevolvido = Number(somas[0].total);
        const totalEmprestado = Number(emprestimo.qtd_emprestimo);

        let status;

        if (totalDevolvido >= totalEmprestado) {
            status = "Devolvido";
        } else {
            const hoje = new Date();

            const hojeFormatado = [
                hoje.getFullYear(),
                String(hoje.getMonth() + 1).padStart(2, "0"),
                String(hoje.getDate()).padStart(2, "0"),
            ].join("-");

            status =
                formatarData(emprestimo.data_prevista_devolucao) <
                hojeFormatado
                    ? "Atrasado"
                    : "Em andamento";
        }

        await conexao.execute(
            "UPDATE emprestimos SET status = ? WHERE id = ?",
            [status, emprestimo.id]
        );

        return status;
    }

    // Registra uma devolução, impedindo duplicidade por funcionário/equipamento.
    async function registrar(devolucao) {
        const quantidade = validarDados(devolucao);
        const emprestimoId = Number(devolucao.emprestimo_id);
        const conexao = await pool.getConnection();

        try {
            await conexao.beginTransaction();

            const emprestimo = await bloquearEmprestimo(
                conexao,
                emprestimoId
            );

            // NOVA VALIDAÇÃO: verifica devolução do mesmo funcionário/equipamento.
            const [devolucaoExistente] = await conexao.execute(
                `SELECT d.id
                 FROM devolucoes d
                 INNER JOIN emprestimos e
                    ON e.id = d.emprestimo_id
                 WHERE e.funcionario_id = ?
                   AND e.equipamento_id = ?
                 LIMIT 1`,
                [
                    emprestimo.funcionario_id,
                    emprestimo.equipamento_id,
                ]
            );

            if (devolucaoExistente.length > 0) {
                throw new Error(
                    `Já existe uma devolução para este funcionário e equipamento. Edite a devolução ${devolucaoExistente[0].id} em vez de cadastrar outra.`
                );
            }

            if (
                devolucao.data_devolucao <
                formatarData(emprestimo.data_emprestimo)
            ) {
                throw new Error(
                    "A devolução não pode ser anterior ao empréstimo."
                );
            }

            const [somas] = await conexao.execute(
                `SELECT COALESCE(SUM(quantidade_devolvida), 0) AS total
                 FROM devolucoes
                 WHERE emprestimo_id = ?`,
                [emprestimoId]
            );

            const pendente =
                Number(emprestimo.qtd_emprestimo) -
                Number(somas[0].total);

            if (pendente <= 0) {
                throw new Error(
                    "Este empréstimo já teve todas as unidades devolvidas."
                );
            }

            if (quantidade > pendente) {
                throw new Error(
                    `Quantidade excedida. Restam ${pendente} unidade(s) para devolver.`
                );
            }

            const [equipamentos] = await conexao.execute(
                `SELECT id, maximo_equipamentos, qtd_disponivel
                 FROM equipamentos
                 WHERE id = ?
                 FOR UPDATE`,
                [emprestimo.equipamento_id]
            );

            if (equipamentos.length === 0) {
                throw new Error("Equipamento não encontrado.");
            }

            const equipamento = equipamentos[0];

            const novoDisponivel =
                Number(equipamento.qtd_disponivel) + quantidade;

            if (
                novoDisponivel >
                Number(equipamento.maximo_equipamentos)
            ) {
                throw new Error(
                    "A devolução ultrapassaria a quantidade máxima cadastrada no estoque."
                );
            }

            const [resultado] = await conexao.execute(
                `INSERT INTO devolucoes (
                    emprestimo_id,
                    data_devolucao,
                    quantidade_devolvida
                ) VALUES (?, ?, ?, ?)`,
                [
                    emprestimoId,
                    devolucao.data_devolucao,
                    quantidade
                ]
            );

            await conexao.execute(
                `UPDATE equipamentos
                 SET qtd_disponivel = ?
                 WHERE id = ?`,
                [novoDisponivel, emprestimo.equipamento_id]
            );

            const status = await atualizarStatus(conexao, emprestimo);

            await conexao.commit();

            return {
                id: resultado.insertId,
                emprestimo_id: emprestimoId,
                data_devolucao: devolucao.data_devolucao,
                quantidade_devolvida: quantidade,
                status,
            };
        } catch (erro) {
            await conexao.rollback();
            throw erro;
        } finally {
            conexao.release();
        }
    }

    // Editar continua permitido, inclusive para corrigir uma devolução existente.
    async function atualizar(id, devolucao) {
        const quantidadeNova = validarDados(devolucao);
        const emprestimoNovoId = Number(devolucao.emprestimo_id);
        const conexao = await pool.getConnection();

        try {
            await conexao.beginTransaction();

            const [registros] = await conexao.execute(
                "SELECT * FROM devolucoes WHERE id = ?",
                [id]
            );

            if (registros.length === 0) {
                await conexao.rollback();
                return null;
            }

            const atual = registros[0];
            const emprestimoAntigoId = Number(atual.emprestimo_id);

            const idsEmprestimos = [
                ...new Set([emprestimoAntigoId, emprestimoNovoId]),
            ].sort((a, b) => a - b);

            const emprestimos = {};

            for (const emprestimoId of idsEmprestimos) {
                emprestimos[emprestimoId] = await bloquearEmprestimo(
                    conexao,
                    emprestimoId
                );
            }

            const antigo = emprestimos[emprestimoAntigoId];
            const novo = emprestimos[emprestimoNovoId];

            if (
                devolucao.data_devolucao <
                formatarData(novo.data_emprestimo)
            ) {
                throw new Error(
                    "A devolução não pode ser anterior ao empréstimo."
                );
            }

            // Não considera a própria devolução ao calcular a quantidade restante.
            const [somas] = await conexao.execute(
                `SELECT COALESCE(SUM(quantidade_devolvida), 0) AS total
                 FROM devolucoes
                 WHERE emprestimo_id = ? AND id <> ?`,
                [emprestimoNovoId, id]
            );

            const pendente =
                Number(novo.qtd_emprestimo) - Number(somas[0].total);

            if (quantidadeNova > pendente) {
                throw new Error(
                    `Quantidade excedida. Restam ${pendente} unidade(s) para devolver.`
                );
            }

            // Bloqueia os equipamentos em ordem de ID.
            const idsEquipamentos = [
                ...new Set([
                    Number(antigo.equipamento_id),
                    Number(novo.equipamento_id),
                ]),
            ].sort((a, b) => a - b);

            const equipamentos = {};

            for (const equipamentoId of idsEquipamentos) {
                const [linhas] = await conexao.execute(
                    `SELECT id, maximo_equipamentos, qtd_disponivel
                     FROM equipamentos
                     WHERE id = ?
                     FOR UPDATE`,
                    [equipamentoId]
                );

                if (linhas.length === 0) {
                    throw new Error("Equipamento não encontrado.");
                }

                equipamentos[equipamentoId] = linhas[0];
            }

            // Calcula a disponibilidade final sem atualizar o estoque duas vezes.
            const equipamentoAntigo =
                equipamentos[Number(antigo.equipamento_id)];

            const equipamentoNovo =
                equipamentos[Number(novo.equipamento_id)];

            let disponivelAtualizado;

            if (
                Number(antigo.equipamento_id) ===
                Number(novo.equipamento_id)
            ) {
                disponivelAtualizado =
                    Number(equipamentoAntigo.qtd_disponivel) -
                    Number(atual.quantidade_devolvida) +
                    quantidadeNova;
            } else {
                const disponivelAntigo =
                    Number(equipamentoAntigo.qtd_disponivel) -
                    Number(atual.quantidade_devolvida);

                if (disponivelAntigo < 0) {
                    throw new Error(
                        "Não é possível editar esta devolução porque o estoque ficaria negativo."
                    );
                }

                await conexao.execute(
                    `UPDATE equipamentos
                     SET qtd_disponivel = ?
                     WHERE id = ?`,
                    [disponivelAntigo, antigo.equipamento_id]
                );

                disponivelAtualizado =
                    Number(equipamentoNovo.qtd_disponivel) +
                    quantidadeNova;
            }

            if (disponivelAtualizado < 0) {
                throw new Error(
                    "A edição deixaria o estoque negativo."
                );
            }

            if (
                disponivelAtualizado >
                Number(equipamentoNovo.maximo_equipamentos)
            ) {
                throw new Error(
                    "A edição ultrapassaria a quantidade máxima do estoque."
                );
            }

            await conexao.execute(
                `UPDATE equipamentos
                 SET qtd_disponivel = ?
                 WHERE id = ?`,
                [disponivelAtualizado, novo.equipamento_id]
            );

            await conexao.execute(
                `UPDATE devolucoes
                 SET emprestimo_id = ?,
                     data_devolucao = ?,
                     quantidade_devolvida = ?
                 WHERE id = ?`,
                [
                    emprestimoNovoId,
                    devolucao.data_devolucao,
                    quantidadeNova,
                    id,
                ]
            );

            await atualizarStatus(conexao, antigo);

            if (emprestimoAntigoId !== emprestimoNovoId) {
                await atualizarStatus(conexao, novo);
            }

            await conexao.commit();

            return await buscarPorId(id);
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

            const [registros] = await conexao.execute(
                "SELECT * FROM devolucoes WHERE id = ?",
                [id]
            );

            if (registros.length === 0) {
                await conexao.rollback();
                return false;
            }

            const devolucao = registros[0];

            const emprestimo = await bloquearEmprestimo(
                conexao,
                devolucao.emprestimo_id
            );

            const [equipamentos] = await conexao.execute(
                `SELECT id, qtd_disponivel
                 FROM equipamentos
                 WHERE id = ?
                 FOR UPDATE`,
                [emprestimo.equipamento_id]
            );

            if (equipamentos.length === 0) {
                throw new Error("Equipamento não encontrado.");
            }

            const disponivel =
                Number(equipamentos[0].qtd_disponivel) -
                Number(devolucao.quantidade_devolvida);

            if (disponivel < 0) {
                throw new Error(
                    "Não é possível excluir esta devolução porque o estoque ficaria negativo."
                );
            }

            await conexao.execute(
                `UPDATE equipamentos
                 SET qtd_disponivel = ?
                 WHERE id = ?`,
                [disponivel, emprestimo.equipamento_id]
            );

            await conexao.execute(
                "DELETE FROM devolucoes WHERE id = ?",
                [id]
            );

            await atualizarStatus(conexao, emprestimo);

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
        registrar,
        atualizar,
        deletarPorId,
    };
}