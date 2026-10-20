
export default class Funcionario {
    constructor({ id, nome, cargo = null, setor = null, status_funcionarios = "Ativo" }) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new TypeError("O ID deve ser inteiro e positivo");
        }

        if (typeof nome !== "string" || nome.trim() === "") {
            throw new TypeError("Nome é obrigatório");
        }

        if (cargo !== null && typeof cargo !== "string") {
            throw new TypeError("Cargo deve ser um texto");
        }

        if (setor !== null && typeof setor !== "string") {
            throw new TypeError("Setor deve ser um texto");
        }

        if (!["Ativo", "Inativo"].includes(status_funcionarios)) {
            throw new TypeError("Status deve ser Ativo ou Inativo");
        }

        this.id = id;
        this.nome = nome.trim();
        this.cargo = cargo;
        this.setor = setor;
        this.status_funcionarios = status_funcionarios;
    }

    ativar() {
        this.status_funcionarios = "Ativo";
    }

    desativar() {
        this.status_funcionarios = "Inativo";
    }
}
