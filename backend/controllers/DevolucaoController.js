
export function criarDevolucaoController({ devolucaoService }) {
    async function listar(req, res, next) {
        try {
            const devolucoes = await devolucaoService.listar();
            res.status(200).json({ sucesso: true, dados: devolucoes });
        } catch (erro) {
            next(erro);
        }
    }

    async function buscar(req, res, next) {
        try {
            const devolucao = await devolucaoService.buscarPorId(req.params.id);
            res.status(200).json({ sucesso: true, dados: devolucao });
        } catch (erro) {
            if (erro.message.includes("ID deve")) {
                return res.status(400).json({ erro: erro.message });
            }

            if (erro.message.includes("não encontrada")) {
                return res.status(404).json({ erro: erro.message });
            }

            next(erro);
        }
    }

    async function criar(req, res, next) {
        try {
            const devolucaoNova = await devolucaoService.criar(req.body);

            res.status(201).json({
                sucesso: true,
                mensagem: "Devolução registrada com sucesso",
                dados: devolucaoNova
            });
        } catch (erro) {
            if (
                erro instanceof TypeError ||
                erro instanceof RangeError ||
                erro.message.includes("inválido") ||
                erro.message.includes("não encontrado") ||
                erro.message.includes("quantidade") ||
                erro.message.includes("empréstimo")
            ) {
                return res.status(400).json({
                    sucesso: false,
                    erro: erro.message
                });
            }

            next(erro);
        }
    }

    async function atualizar(req, res, next) {
        try {
            const devolucaoAtualizada = await devolucaoService.atualizar(
                req.params.id,
                req.body
            );

            res.status(200).json({
                sucesso: true,
                mensagem: "Devolução atualizada com sucesso",
                dados: devolucaoAtualizada
            });
        } catch (erro) {
            if (erro.message.includes("ID deve")) {
                return res.status(400).json({ erro: erro.message });
            }

            if (erro.message.includes("não encontrada")) {
                return res.status(404).json({ erro: erro.message });
            }

            if (
                erro instanceof TypeError ||
                erro instanceof RangeError ||
                erro.message.includes("inválido") ||
                erro.message.includes("quantidade") ||
                erro.message.includes("empréstimo")
            ) {
                return res.status(400).json({
                    sucesso: false,
                    erro: erro.message
                });
            }

            next(erro);
        }
    }

    async function deletar(req, res, next) {
        try {
            await devolucaoService.deletarPorId(req.params.id);

            res.status(200).json({
                sucesso: true,
                mensagem: "Devolução excluída com sucesso"
            });
        } catch (erro) {
            if (erro.message.includes("ID deve")) {
                return res.status(400).json({ erro: erro.message });
            }

            if (erro.message.includes("não encontrada")) {
                return res.status(404).json({ erro: erro.message });
            }

            if (
                erro.message.includes("estoque") ||
                erro.message.includes("disponível") ||
                erro.message.includes("conflito")
            ) {
                return res.status(409).json({
                    sucesso: false,
                    erro: erro.message
                });
            }

            next(erro);
        }
    }

    return { listar, buscar, criar, atualizar, deletar };
}
