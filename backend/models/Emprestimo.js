export default class Emprestimo {
    constructor({
        id,
        funcionario_id,
        equipamento_id,
        data_emprestimo,
        data_prevista_devolucao,
        qtd_emprestimo,
        status
    }) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new TypeError("O número deve ser inteiro e positivo");
        }

        if (!Number.isInteger(funcionario_id) || funcionario_id <= 0) {
            throw new TypeError("ID do funcionário inválido");
        }

        if (!Number.isInteger(equipamento_id) || equipamento_id <= 0) {
            throw new TypeError("ID do equipamento inválido");
        }

        if (!Number.isInteger(qtd_emprestimo) || qtd_emprestimo <= 0) {
            throw new TypeError("Quantidade emprestada inválida");
        }

        this.id = id;
        this.funcionario_id = funcionario_id;
        this.equipamento_id = equipamento_id;
        this.data_emprestimo = data_emprestimo;
        this.data_prevista_devolucao = data_prevista_devolucao;
        this.qtd_emprestimo = qtd_emprestimo;
        this.status = status;
    }
}