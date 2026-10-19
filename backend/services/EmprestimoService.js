import Emprestimo from "../models/Emprestimo.js";

export function criarEmprestimoService({ emprestimoModel }) {

    async function listar() {
        return emprestimoModel.listarTodos();
    }

    async function buscarPorId(idRecebido) {
        const id = Number(idRecebido);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID deve ser um número inteiro positivo");
        }

        const emprestimo = await emprestimoModel.buscarPorId(id);

        if (!emprestimo) {
            throw new Error(`Empréstimo ${id} não encontrado`);
        }

        return emprestimo;
    }

    async function deletarPorId(idRecebido) {
        const id = Number(idRecebido);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID deve ser um número inteiro positivo");
        }

        const deletado = await emprestimoModel.deletarPorId(id);

        if (!deletado) {
            throw new Error(`Empréstimo ${id} não encontrado`);
        }

        return true;
    }

    async function criar(dados) {
        const emprestimo = new Emprestimo({ id: 1, ...dados });

        return emprestimoModel.criar({
            funcionario_id: emprestimo.funcionario_id,
            equipamento_id: emprestimo.equipamento_id,
            data_emprestimo: emprestimo.data_emprestimo,
            data_prevista_devolucao: emprestimo.data_prevista_devolucao,
            qtd_emprestimo: emprestimo.qtd_emprestimo,
            status: emprestimo.status
        });
    }

    async function atualizar(idRecebido, dados) {
        const id = Number(idRecebido);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID deve ser um número inteiro positivo");
        }

        const emprestimoExistente = await emprestimoModel.buscarPorId(id);

        if (!emprestimoExistente) {
            throw new Error(`Empréstimo ${id} não encontrado`);
        }

        const emprestimo = new Emprestimo({ id, ...dados });

        return emprestimoModel.atualizar(id, {
            funcionario_id: emprestimo.funcionario_id,
            equipamento_id: emprestimo.equipamento_id,
            data_emprestimo: emprestimo.data_emprestimo,
            data_prevista_devolucao: emprestimo.data_prevista_devolucao,
            qtd_emprestimo: emprestimo.qtd_emprestimo,
            status: emprestimo.status
        });
    }

    return { listar, buscarPorId, deletarPorId, criar, atualizar };
}