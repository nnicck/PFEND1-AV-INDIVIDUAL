export default class Devolucao {
    constructor({
        id,
        emprestimo_id,
        data_devolucao,
        quantidade_devolvida,
        condicao
    }) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new TypeError("O número deve ser inteiro e positivo");
        }

        if (!Number.isInteger(emprestimo_id) || emprestimo_id <= 0) {
            throw new TypeError("ID do empréstimo inválido");
        }

        if (!Number.isInteger(quantidade_devolvida) || quantidade_devolvida <= 0) {
            throw new TypeError("Quantidade devolvida inválida");
        }

        this.id = id;
        this.emprestimo_id = emprestimo_id;
        this.data_devolucao = data_devolucao;
        this.quantidade_devolvida = quantidade_devolvida;
        this.condicao = condicao;
    }
}