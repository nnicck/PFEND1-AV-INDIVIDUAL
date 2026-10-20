CREATE TABLE funcionarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cargo VARCHAR(100),
    setor VARCHAR(100),
    status_funcionarios VARCHAR(100) DEFAULT 'Ativo'
);

CREATE TABLE equipamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    categoria VARCHAR(100),
    fabricante VARCHAR(100),
    maximo_equipamentos INT NOT NULL,
    qtd_disponivel INT NOT NULL,

    CHECK (maximo_equipamentos >= 0),
    CHECK (qtd_disponivel >= 0),
    CHECK (qtd_disponivel <= maximo_equipamentos)
);

CREATE TABLE emprestimos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    funcionario_id INT NOT NULL,
    equipamento_id INT NOT NULL,
    data_emprestimo DATE NOT NULL,
    data_prevista_devolucao DATE NOT NULL,
    qtd_emprestimo INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Em andamento',

    FOREIGN KEY (funcionario_id)
        REFERENCES funcionarios(id),

    FOREIGN KEY (equipamento_id)
        REFERENCES equipamentos(id),

    CHECK (qtd_emprestimo > 0),
    CHECK (data_prevista_devolucao >= data_emprestimo),
    CHECK (status IN ('Em andamento', 'Devolvido', 'Atrasado'))
);

CREATE TABLE devolucoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    emprestimo_id INT NOT NULL,
    data_devolucao DATE NOT NULL,
    quantidade_devolvida INT NOT NULL,
    condicao VARCHAR(50) NOT NULL,

    FOREIGN KEY (emprestimo_id)
        REFERENCES emprestimos(id),

    CHECK (quantidade_devolvida > 0)
);