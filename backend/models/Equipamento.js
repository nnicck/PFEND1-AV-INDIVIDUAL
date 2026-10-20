
export default class Equipamento {
    constructor({
        id,
        nome,
        categoria = null,
        fabricante = null,
        maximo_equipamentos,
        qtd_disponivel
    }) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new TypeError("O ID deve ser inteiro e positivo");
        }

        if (typeof nome !== "string" || nome.trim() === "") {
            throw new TypeError("Nome é obrigatório");
        }

        if (categoria !== null && typeof categoria !== "string") {
            throw new TypeError("Categoria deve ser um texto");
        }

        if (fabricante !== null && typeof fabricante !== "string") {
            throw new TypeError("Fabricante deve ser um texto");
        }

        if (!Number.isInteger(maximo_equipamentos) || maximo_equipamentos < 0) {
            throw new TypeError("A quantidade total deve ser um inteiro maior ou igual a zero");
        }

        if (!Number.isInteger(qtd_disponivel) || qtd_disponivel < 0) {
            throw new TypeError("A quantidade disponível deve ser válida");
        }

        if (qtd_disponivel > maximo_equipamentos) {
            throw new RangeError("A quantidade disponível não pode superar a quantidade total");
        }

        this.id = id;
        this.nome = nome.trim();
        this.categoria = categoria;
        this.fabricante = fabricante;
        this.maximo_equipamentos = maximo_equipamentos;
        this.qtd_disponivel = qtd_disponivel;
    }

    calcularQuantidadeEmprestada() {
        return this.maximo_equipamentos - this.qtd_disponivel;
    }

    temDisponibilidade(quantidade) {
        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            throw new TypeError("A quantidade deve ser um inteiro positivo");
        }

        return this.qtd_disponivel >= quantidade;
    }
}
