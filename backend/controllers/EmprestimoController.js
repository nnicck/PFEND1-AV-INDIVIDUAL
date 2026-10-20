
export function criarEmprestimoController({ emprestimoService }) {
    async function listar(req, res, next) {
        try {
            const emprestimos = await emprestimoService.listar();
            res.status(200).json({ sucesso: true, dados: emprestimos });
        } catch (erro) {
            next(erro);
        }
    }

    async function buscar(req, res, next) {
        try {
            const emprestimo = await emprestimoService.buscarPorId(req.params.id);
            res.status(200).json({ sucesso: true, dados: emprestimo });
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
            const emprestimoNovo = await emprestimoService.criar(req.body);

            res.status(201).json({
                sucesso: true,
                dados: emprestimoNovo
            });
        } catch (erro) {
            if (
                erro instanceof TypeError ||
                erro instanceof RangeError ||
                erro.message.includes("inválido") ||
                erro.message.includes("disponível") ||
                erro.message.includes("não encontrado")
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
            const emprestimoAtualizado = await emprestimoService.atualizar(
                req.params.id,
                req.body
            );

            res.status(200).json({
                sucesso: true,
                mensagem: "Empréstimo atualizado com sucesso",
                dados: emprestimoAtualizado
            });
        } catch (erro) {
            if (erro.message.includes("ID deve")) {
                return res.status(400).json({ erro: erro.message });
            }

            if (erro.message.includes("não encontrado")) {
                return res.status(404).json({ erro: erro.message });
            }

            if (
                erro instanceof TypeError ||
                erro instanceof RangeError ||
                erro.message.includes("inválido") ||
                erro.message.includes("disponível")
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
            await emprestimoService.deletarPorId(req.params.id);

            res.status(200).json({
                sucesso: true,
                mensagem: "Empréstimo excluído com sucesso"
            });
        } catch (erro) {
            if (erro.message.includes("ID deve")) {
                return res.status(400).json({ erro: erro.message });
            }

            if (erro.message.includes("não encontrado")) {
                return res.status(404).json({ erro: erro.message });
            }

            if (erro.message.includes("devolução")) {
                return res.status(409).json({ sucesso: false, erro: erro.message });
            }

            next(erro);
        }
    }

    return { listar, buscar, criar, atualizar, deletar };
}
