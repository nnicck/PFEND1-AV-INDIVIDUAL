
import Equipamento from "../models/Equipamento.js";

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

    async function criar(dados) {
        const equipamento = new Equipamento({
            id: 1,
            ...dados
        });

        return equipamentoModel.criar({
            nome: equipamento.nome,
            categoria: equipamento.categoria,
            fabricante: equipamento.fabricante,
            maximo_equipamentos: equipamento.maximo_equipamentos,
            qtd_disponivel: equipamento.qtd_disponivel
        });
    }

    async function atualizar(idRecebido, dados) {
        const id = Number(idRecebido);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID deve ser um número inteiro positivo");
        }

        const existente = await equipamentoModel.buscarPorId(id);

        if (!existente) {
            throw new Error(`Equipamento ${id} não encontrado`);
        }

        const equipamento = new Equipamento({
            ...existente,
            ...dados,
            id
        });

        return equipamentoModel.atualizar(id, {
            nome: equipamento.nome,
            categoria: equipamento.categoria,
            fabricante: equipamento.fabricante,
            maximo_equipamentos: equipamento.maximo_equipamentos,
            qtd_disponivel: equipamento.qtd_disponivel
        });
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

    return {
        listar,
        buscarPorId,
        criar,
        atualizar,
        deletarPorId
    };
}
