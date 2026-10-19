export default class Funcionario {
    constructor({ id, nome, cargo, status_funcionario, setor }) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new TypeError("O número deve ser inteiro e positivo");
        }

        if (typeof nome !== "string" || nome.trim() === "") {
            throw new TypeError("Nome é obrigatório");
        }

        if (typeof cargo !== "string" || cargo.trim() === "") {
            throw new TypeError("Cargo é obrigatório");
        }

        if (typeof status_funcionario !== "string" || status_funcionario.trim() === "") {
            throw new TypeError("Status do funcionário é obrigatório");
        }

        if (typeof setor !== "string" || setor.trim() === "") {
            throw new TypeError("Setor é obrigatório");
        }

        this.id = id;
        this.nome = nome;
        this.cargo = cargo;
        this.status_funcionario = status_funcionario;
        this.setor = setor;
    }
}