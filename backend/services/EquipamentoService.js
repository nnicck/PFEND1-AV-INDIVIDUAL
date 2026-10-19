import Equipamento from "../models/Equipamentos.js";

export function criarEquipamentoService({ equipamentoModel }) {

    async function listar() {
        return equipamentoModel.listarTodos();
    }

    async function buscarPorId(idRecebido) {
        const id = Number(idRecebido);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID deve ser um número inteiro positivo");
        }

        const equipamento = await equipamentoModel.buscarPorId(id);

        if (!equipamento) {
            throw new Error(`Equipamento ${id} não encontrado`);
        }

        return equipamento;
    }

    async function deletarPorId(idRecebido) {
        const id = Number(idRecebido);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID deve ser um número inteiro positivo");
        }

        const deletado = await equipamentoModel.deletarPorId(id);

        if (!deletado) {
            throw new Error(`Equipamento ${id} não encontrado`);
        }

        return true;
    }

    async function criar(dados) {
        const equipamento = new Equipamento({ id: 1, ...dados });

        return equipamentoModel.criar({
            nome: equipamento.nome,
            categoria: equipamento.categoria,
            qtd_equipamentos: equipamento.qtd_equipamentos,
            qtd_disponivel: equipamento.qtd_disponivel
        });
    }

    async function atualizar(idRecebido, dados) {
        const id = Number(idRecebido);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID deve ser um número inteiro positivo");
        }

        const equipamentoExistente = await equipamentoModel.buscarPorId(id);

        if (!equipamentoExistente) {
            throw new Error(`Equipamento ${id} não encontrado`);
        }

        const equipamento = new Equipamento({ id, ...dados });

        return equipamentoModel.atualizar(id, {
            nome: equipamento.nome,
            categoria: equipamento.categoria,
            qtd_equipamentos: equipamento.qtd_equipamentos,
            qtd_disponivel: equipamento.qtd_disponivel
        });
    }

    return {
        listar,
        buscarPorId,
        deletarPorId,
        criar,
        atualizar
    };
}