export default class Equipamento {
    constructor({ id, nome, categoria, qtd_equipamentos, qtd_disponivel }) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new TypeError("O número deve ser inteiro e positivo");
        }

        if (typeof nome !== "string" || nome.trim() === "") {
            throw new TypeError("Nome é obrigatório");
        }

        if (typeof categoria !== "string" || categoria.trim() === "") {
            throw new TypeError("Categoria é obrigatória");
        }

        if (!Number.isInteger(qtd_equipamentos) || qtd_equipamentos < 0) {
            throw new TypeError("Quantidade de equipamentos deve ser válida");
        }

        if (!Number.isInteger(qtd_disponivel) || qtd_disponivel < 0) {
            throw new TypeError("Quantidade disponível deve ser válida");
        }

        if (qtd_disponivel > qtd_equipamentos) {
            throw new RangeError("Quantidade disponível não pode ser maior que a quantidade total");
        }

        this.id = id;
        this.nome = nome;
        this.categoria = categoria;
        this.qtd_equipamentos = qtd_equipamentos;
        this.qtd_disponivel = qtd_disponivel;
    }

    // qtd_equipamentos: 20 notebooks no total.
    // qtd_disponivel: 15 notebooks disponíveis para empréstimo.
    //5 notebooks estão emprestados ou indisponíveis.

    calcularQtdEmprestada() {
        return this.qtd_equipamentos - this.qtd_disponivel;
    }

    verificarDisponibilidade(quantidade) {
        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            throw new TypeError("A quantidade deve ser um inteiro positivo");
        }

        return this.qtd_disponivel >= quantidade; //true
    }
}