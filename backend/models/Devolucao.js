
export default class Devolucao {
    constructor({
        id,
        emprestimo_id,
        data_devolucao,
        quantidade_devolvida,

    }) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new TypeError("O ID deve ser inteiro e positivo");
        }

        if (!Number.isInteger(emprestimo_id) || emprestimo_id <= 0) {
            throw new TypeError("O empréstimo informado é inválido");
        }

        if (!dataValida(data_devolucao)) {
            throw new TypeError("A data de devolução é inválida");
        }

        if (!Number.isInteger(quantidade_devolvida) || quantidade_devolvida <= 0) {
            throw new TypeError("A quantidade devolvida deve ser um inteiro positivo");
        }


        this.id = id;
        this.emprestimo_id = emprestimo_id;
        this.data_devolucao = data_devolucao;
        this.quantidade_devolvida = quantidade_devolvida;
      
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
