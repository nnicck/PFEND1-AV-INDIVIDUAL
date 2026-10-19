export function criarFuncionarioController({ funcionarioService }) {

    async function listar(req, res, next) {
        try {
            const funcionarios = await funcionarioService.listar();
            res.status(200).json({ sucesso: true, dados: funcionarios });
        } catch (erro) {
            next(erro);
        }
    }

    async function buscar(req, res, next) {
        try {
            const funcionario = await funcionarioService.buscarPorId(req.params.id);
            res.status(200).json({ sucesso: true, dados: funcionario });
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

    async function deletar(req, res, next) {
        try {
            await funcionarioService.deletarPorId(req.params.id);
            res.status(200).json({
                sucesso: true,
                mensagem: "Funcionário excluído com sucesso"
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

    async function atualizar(req, res, next) {
        try {
            const funcionarioAtualizado = await funcionarioService.atualizar(
                req.params.id,
                req.body
            );

            res.status(200).json({
                sucesso: true,
                mensagem: "Funcionário atualizado com sucesso",
                dados: funcionarioAtualizado
            });
        } catch (erro) {
            if (erro.message.includes("ID deve")) {
                return res.status(400).json({ erro: erro.message });
            }

            if (erro.message.includes("não encontrado")) {
                return res.status(404).json({ erro: erro.message });
            }

            if (erro instanceof Error) {
                return res.status(400).json({
                    sucesso: false,
                    erro: erro.message
                });
            }

            next(erro);
        }
    }

    async function criar(req, res, next) {
        try {
            const funcionarioNovo = await funcionarioService.criar(req.body);
            res.status(201).json({ sucesso: true, dados: funcionarioNovo });
        } catch (erro) {
            res.status(400).json({ sucesso: false, erro: erro.message });
        }
    }

    return { listar, buscar, criar, deletar, atualizar };
}