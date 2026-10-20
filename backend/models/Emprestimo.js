
export default class Emprestimo {
    constructor({
        id,
        funcionario_id,
        equipamento_id,
        data_emprestimo,
        data_prevista_devolucao,
        qtd_emprestimo,
        status = "Em andamento"
    }) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new TypeError("O ID deve ser inteiro e positivo");
        }

        if (!Number.isInteger(funcionario_id) || funcionario_id <= 0) {
            throw new TypeError("O funcionário informado é inválido");
        }

        if (!Number.isInteger(equipamento_id) || equipamento_id <= 0) {
            throw new TypeError("O equipamento informado é inválido");
        }

        if (!Number.isInteger(qtd_emprestimo) || qtd_emprestimo <= 0) {
            throw new TypeError("A quantidade emprestada deve ser um inteiro positivo");
        }

        if (!dataValida(data_emprestimo) || !dataValida(data_prevista_devolucao)) {
            throw new TypeError("As datas do empréstimo são inválidas");
        }

        if (data_prevista_devolucao < data_emprestimo) {
            throw new RangeError("A devolução prevista não pode ser anterior ao empréstimo");
        }

        if (!["Em andamento", "Devolvido", "Atrasado"].includes(status)) {
            throw new TypeError("Status do empréstimo inválido");
        }

        this.id = id;
        this.funcionario_id = funcionario_id;
        this.equipamento_id = equipamento_id;
        this.data_emprestimo = data_emprestimo;
        this.data_prevista_devolucao = data_prevista_devolucao;
        this.qtd_emprestimo = qtd_emprestimo;
        this.status = status;
    }

    estaAtrasado(hoje = new Date().toISOString().slice(0, 10)) {
        return (
            this.status === "Em andamento" &&
            this.data_prevista_devolucao < hoje
        );
    }

    calcularStatus(hoje = new Date().toISOString().slice(0, 10)) {
        if (this.status === "Devolvido") {
            return "Devolvido";
        }

        if (this.data_prevista_devolucao < hoje) {
            return "Atrasado";
        }

        return "Em andamento";
    }
}

function dataValida(data) {
    if (typeof data !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data)) {
        return false;
    }

    const [ano, mes, dia] = data.split("-").map(Number);
    const dataObj = new Date(Date.UTC(ano, mes - 1, dia));

    return (
        dataObj.getUTCFullYear() === ano &&
        dataObj.getUTCMonth() === mes - 1 &&
        dataObj.getUTCDate() === dia
    );
}
