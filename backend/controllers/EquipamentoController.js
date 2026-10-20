
export function criarEquipamentoController({ equipamentoService }) {
    async function listar(req, res, next) {
        try {
            const equipamentos = await equipamentoService.listar();
            res.status(200).json({ sucesso: true, dados: equipamentos });
        } catch (erro) {
            next(erro);
        }
    }

    async function buscar(req, res, next) {
        try {
            const equipamento = await equipamentoService.buscarPorId(req.params.id);
            res.status(200).json({ sucesso: true, dados: equipamento });
        } catch (erro) {
            if (erro.message.includes("ID deve")) {
                return res.status(400).json({ erro: erro.message });
            }

            if (erro.message.includes("não encontrado")) {
                return res.status(404).json({ erro: erro.message });
            }

            next(erro);
        }
    }

    async function criar(req, res, next) {
        try {
            const equipamentoNovo = await equipamentoService.criar(req.body);

            res.status(201).json({
                sucesso: true,
                dados: equipamentoNovo
            });
        } catch (erro) {
            if (erro instanceof TypeError || erro instanceof RangeError) {
                return res.status(400).json({ sucesso: false, erro: erro.message });
            }

            next(erro);
        }
    }

    async function atualizar(req, res, next) {
        try {
            const equipamentoAtualizado = await equipamentoService.atualizar(
                req.params.id,
                req.body
            );

            res.status(200).json({
                sucesso: true,
                mensagem: "Equipamento atualizado com sucesso",
                dados: equipamentoAtualizado
            });
        } catch (erro) {
            if (erro.message.includes("ID deve")) {
                return res.status(400).json({ erro: erro.message });
            }

            if (erro.message.includes("não encontrado")) {
                return res.status(404).json({ erro: erro.message });
            }

            if (erro instanceof TypeError || erro instanceof RangeError) {
                return res.status(400).json({ sucesso: false, erro: erro.message });
            }

            next(erro);
        }
    }

    async function deletar(req, res, next) {
        try {
            await equipamentoService.deletarPorId(req.params.id);

            res.status(200).json({
                sucesso: true,
                mensagem: "Equipamento excluído com sucesso"
            });
        } catch (erro) {
            if (erro.message.includes("ID deve")) {
                return res.status(400).json({ erro: erro.message });
            }

            if (erro.message.includes("não encontrado")) {
                return res.status(404).json({ erro: erro.message });
            }

            next(erro);
        }
    }

    return { listar, buscar, criar, atualizar, deletar };
}
