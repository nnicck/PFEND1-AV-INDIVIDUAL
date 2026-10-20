
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
            throw new Error("A quantidade devolvida deve ser maior que zero.");
        }

        if (!validarData(devolucao.data_devolucao)) {
            throw new Error("Informe uma data de devolução válida.");
        }

        if (
            typeof devolucao.condicao !== "string" ||
            !devolucao.condicao.trim()
        ) {
            throw new Error("Informe a condição do equipamento.");
        }

        return quantidade;
    }

    async function listarTodos() {
        const sql = `
            SELECT
                d.*,
                e.funcionario_id,
                f.nome AS funcionario,
                e.equipamento_id,
                eq.nome AS equipamento
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
        const [linhas] = await pool.query(
            "SELECT * FROM devolucoes WHERE id = ?",
            [id]
        );

        return linhas.length === 0 ? null : linhas[0];
    }

    // Atualiza o status de acordo com o total devolvido
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
                String(hoje.getDate()).padStart(2, "0")
            ].join("-");

            status =
                formatarData(emprestimo.data_prevista_devolucao) < hojeFormatado
                    ? "Atrasado"
                    : "Em andamento";
        }

        await conexao.execute(
            "UPDATE emprestimos SET status = ? WHERE id = ?",
            [status, emprestimo.id]
        );

        return status;
    }

    // Bloqueia o empréstimo para impedir alterações concorrentes
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

            if (quantidade > pendente) {
                throw new Error(
                    `Quantidade excedida. Restam ${pendente} unidade(s) para devolver.`
                );
            }

            const [resultado] = await conexao.execute(
                `INSERT INTO devolucoes (
                    emprestimo_id,
                    data_devolucao,
                    quantidade_devolvida,
                    condicao
                ) VALUES (?, ?, ?, ?)`,
                [
                    emprestimoId,
                    devolucao.data_devolucao,
                    quantidade,
                    devolucao.condicao.trim()
                ]
            );

            await conexao.execute(
                `UPDATE equipamentos
                 SET qtd_disponivel = qtd_disponivel + ?
                 WHERE id = ?`,
                [quantidade, emprestimo.equipamento_id]
            );

            const status = await atualizarStatus(conexao, emprestimo);

            await conexao.commit();

            return {
                id: resultado.insertId,
                emprestimo_id: emprestimoId,
                data_devolucao: devolucao.data_devolucao,
                quantidade_devolvida: quantidade,
                condicao: devolucao.condicao.trim(),
                status
            };

        } catch (erro) {
            await conexao.rollback();
            throw erro;
        } finally {
            conexao.release();
        }
    }

    async function atualizar(id, devolucao) {
        const quantidadeNova = validarDados(devolucao);
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
            const emprestimoNovoId = Number(devolucao.emprestimo_id);

            // Bloqueia os empréstimos em ordem de ID
            const ids = [...new Set([
                emprestimoAntigoId,
                emprestimoNovoId
            ])].sort((a, b) => a - b);

            const emprestimos = {};

            for (const emprestimoId of ids) {
                emprestimos[emprestimoId] =
                    await bloquearEmprestimo(conexao, emprestimoId);
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

            // Exclui a quantidade atual da soma para calcular
            // corretamente a nova quantidade permitida
            const [somas] = await conexao.execute(
                `SELECT COALESCE(SUM(quantidade_devolvida), 0) AS total
                 FROM devolucoes
                 WHERE emprestimo_id = ? AND id <> ?`,
                [emprestimoNovoId, id]
            );

            const jaDevolvido = Number(somas[0].total);
            const pendente =
                Number(novo.qtd_emprestimo) - jaDevolvido;

            if (quantidadeNova > pendente) {
                throw new Error(
                    `Quantidade excedida. Restam ${pendente} unidade(s) para devolver.`
                );
            }

            // Bloquear equipamentos em ordem de ID
            const equipamentoIds = [...new Set([
                Number(atual.emprestimo_id),
                Number(devolucao.emprestimo_id)
            ].map(emprestimoId =>
                Number(emprestimos[emprestimoId].equipamento_id)
            ))].sort((a, b) => a - b);

            for (const equipamentoId of equipamentoIds) {
                const [linhas] = await conexao.execute(
                    `SELECT id
                     FROM equipamentos
                     WHERE id = ?
                     FOR UPDATE`,
                    [equipamentoId]
                );

                if (linhas.length === 0) {
                    throw new Error("Equipamento não encontrado.");
                }
            }

            // Reverter a devolução antiga
            await conexao.execute(
                `UPDATE equipamentos
                 SET qtd_disponivel = qtd_disponivel - ?
                 WHERE id = ?`,
                [atual.quantidade_devolvida, antigo.equipamento_id]
            );

            // Aplicar a devolução corrigida
            await conexao.execute(
                `UPDATE equipamentos
                 SET qtd_disponivel = qtd_disponivel + ?
                 WHERE id = ?`,
                [quantidadeNova, novo.equipamento_id]
            );

            await conexao.execute(
                `UPDATE devolucoes
                 SET emprestimo_id = ?,
                     data_devolucao = ?,
                     quantidade_devolvida = ?,
                     condicao = ?
                 WHERE id = ?`,
                [
                    emprestimoNovoId,
                    devolucao.data_devolucao,
                    quantidadeNova,
                    devolucao.condicao.trim(),
                    id
                ]
            );

            await atualizarStatus(conexao, antigo);

            if (emprestimoAntigoId !== emprestimoNovoId) {
                await atualizarStatus(conexao, novo);
            } else {
                await atualizarStatus(conexao, antigo);
            }

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
                `SELECT id
                 FROM equipamentos
                 WHERE id = ?
                 FOR UPDATE`,
                [emprestimo.equipamento_id]
            );

            if (equipamentos.length === 0) {
                throw new Error("Equipamento não encontrado.");
            }

            // Desfazer a entrada no estoque causada pela devolução
            await conexao.execute(
                `UPDATE equipamentos
                 SET qtd_disponivel = qtd_disponivel - ?
                 WHERE id = ?`,
                [
                    devolucao.quantidade_devolvida,
                    emprestimo.equipamento_id
                ]
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
        deletarPorId
    };
}
