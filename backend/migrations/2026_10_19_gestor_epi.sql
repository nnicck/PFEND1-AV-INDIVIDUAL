CREATE DATABASE gestor_epi;

USE gestor_epi;

CREATE TABLE funcionarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    cargo VARCHAR(100),
    status_funcionario VARCHAR(100),
    setor VARCHAR(100)
);

CREATE TABLE equipamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100),
    categoria VARCHAR(100),
    qtd_equipamentos INT,
    qtd_disponivel INT
);

CREATE TABLE emprestimos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    funcionario_id INT,
    equipamento_id INT,
    data_emprestimo DATE,
    data_prevista_devolucao DATE,
    qtd_emprestimo INT,
    status VARCHAR(30),

    FOREIGN KEY (funcionario_id)
        REFERENCES funcionarios(id),

    FOREIGN KEY (equipamento_id)
        REFERENCES equipamentos(id)
);

CREATE TABLE devolucoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emprestimo_id INT,
    data_devolucao DATE,
    quantidade_devolvida INT,
    condicao VARCHAR(50),

    FOREIGN KEY (emprestimo_id)
        REFERENCES emprestimos(id)
);
