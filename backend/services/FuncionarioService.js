
import Funcionario from "../models/Funcionario.js";

export function criarFuncionarioService({ funcionarioModel }) {
    async function listar() {
        return funcionarioModel.listarTodos();
    }

    async function buscarPorId(idRecebido) {
        const id = Number(idRecebido);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID deve ser um número inteiro positivo");
        }

        const funcionario = await funcionarioModel.buscarPorId(id);

        if (!funcionario) {
            throw new Error(`Funcionário ${id} não encontrado`);
        }

        return funcionario;
    }

    async function criar(dados) {
        const funcionario = new Funcionario({
            id: 1,
            ...dados
        });

        return funcionarioModel.criar({
            nome: funcionario.nome,
            cargo: funcionario.cargo,
            setor: funcionario.setor,
            status_funcionarios: funcionario.status_funcionarios
        });
    }

    async function atualizar(idRecebido, dados) {
        const id = Number(idRecebido);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID deve ser um número inteiro positivo");
        }

        const existente = await funcionarioModel.buscarPorId(id);

        if (!existente) {
            throw new Error(`Funcionário ${id} não encontrado`);
        }

        const funcionario = new Funcionario({
            ...existente,
            ...dados,
            id
        });

        return funcionarioModel.atualizar(id, {
            nome: funcionario.nome,
            cargo: funcionario.cargo,
            setor: funcionario.setor,
            status_funcionarios: funcionario.status_funcionarios
        });
    }

    async function deletarPorId(idRecebido) {
        const id = Number(idRecebido);

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID deve ser um número inteiro positivo");
        }

        const deletado = await funcionarioModel.deletarPorId(id);

        if (!deletado) {
            throw new Error(`Funcionário ${id} não encontrado`);
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
