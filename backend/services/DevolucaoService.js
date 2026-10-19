import Devolucao from "../models/Devolucao.js";

export function criarDevolucaoService({ devolucaoModel }) {

    async function listar() {
        return devolucaoModel.listarTodos();
    }

    async function buscarPorId(idRecebido) {
        const id = Number(idRecebido);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID deve ser um número inteiro positivo");
        }

        const devolucao = await devolucaoModel.buscarPorId(id);

        if (!devolucao) {
            throw new Error(`Devolução ${id} não encontrada`);
        }

        return devolucao;
    }

    async function deletarPorId(idRecebido) {
        const id = Number(idRecebido);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID deve ser um número inteiro positivo");
        }

        const deletado = await devolucaoModel.deletarPorId(id);

        if (!deletado) {
            throw new Error(`Devolução ${id} não encontrada`);
        }

        return true;
    }

    async function criar(dados) {
        const devolucao = new Devolucao({ id: 1, ...dados });

        return devolucaoModel.criar({
            emprestimo_id: devolucao.emprestimo_id,
            data_devolucao: devolucao.data_devolucao,
            quantidade_devolvida: devolucao.quantidade_devolvida,
            condicao: devolucao.condicao
        });
    }

    async function atualizar(idRecebido, dados) {
        const id = Number(idRecebido);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID deve ser um número inteiro positivo");
        }

        const devolucaoExistente = await devolucaoModel.buscarPorId(id);

        if (!devolucaoExistente) {
            throw new Error(`Devolução ${id} não encontrada`);
        }

        const devolucao = new Devolucao({ id, ...dados });

        return devolucaoModel.atualizar(id, {
            emprestimo_id: devolucao.emprestimo_id,
            data_devolucao: devolucao.data_devolucao,
            quantidade_devolvida: devolucao.quantidade_devolvida,
            condicao: devolucao.condicao
        });
    }

    return { listar, buscarPorId, deletarPorId, criar, atualizar };
}