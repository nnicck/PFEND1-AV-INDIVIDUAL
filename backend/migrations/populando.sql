-- 1. FUNCIONÁRIOS
INSERT INTO funcionarios (nome, cargo, status_funcionario, setor)
VALUES
('Carlos Henrique Silva', 'Operador de Produção', 'Ativo', 'Produção'),
('Mariana Oliveira Santos', 'Técnica de Segurança do Trabalho', 'Ativo', 'Segurança do Trabalho'),
('João Pedro Almeida', 'Eletricista Industrial', 'Ativo', 'Manutenção'),
('Fernanda Costa Ribeiro', 'Auxiliar de Almoxarifado', 'Ativo', 'Almoxarifado'),
('Lucas Martins Ferreira', 'Mecânico Industrial', 'Ativo', 'Manutenção'),
('Beatriz Souza Lima', 'Operadora de Máquinas', 'Ativo', 'Produção'),
('Rafael Mendes Carvalho', 'Soldador Industrial', 'Ativo', 'Manutenção'),
('Juliana Pereira Gomes', 'Analista de Qualidade', 'Inativo', 'Qualidade');

-- 2. EQUIPAMENTOS
INSERT INTO equipamentos
(nome, categoria, qtd_equipamentos, qtd_disponivel)
VALUES
('Capacete de Segurança', 'Proteção da Cabeça', 100, 92),
('Óculos de Proteção', 'Proteção dos Olhos', 80, 73),
('Luva de Segurança', 'Proteção das Mãos', 150, 130),
('Botina de Segurança', 'Proteção dos Pés', 60, 53),
('Protetor Auricular', 'Proteção Auditiva', 100, 90),
('Respirador PFF2', 'Proteção Respiratória', 50, 44),
('Cinto de Segurança', 'Proteção contra Quedas', 20, 17),
('Avental de Raspa', 'Proteção do Tronco', 30, 26);

-- 3. EMPRÉSTIMOS
-- Considerando funcionários e equipamentos com IDs iniciando em 1.
INSERT INTO emprestimos
(funcionario_id, equipamento_id, data_emprestimo,
 data_prevista_devolucao, qtd_emprestimo, status)
VALUES
(1, 1, '2026-10-01', '2026-10-30', 2, 'Em andamento'),
(1, 3, '2026-10-01', '2026-10-30', 5, 'Em andamento'),
(2, 2, '2026-10-03', '2026-10-20', 2, 'Em andamento'),
(3, 4, '2026-10-05', '2026-10-19', 1, 'Em andamento'),
(3, 5, '2026-10-05', '2026-10-19', 2, 'Concluído'),
(4, 1, '2026-09-15', '2026-09-30', 3, 'Concluído'),
(5, 6, '2026-10-10', '2026-10-25', 4, 'Em andamento'),
(6, 3, '2026-10-12', '2026-10-26', 10, 'Em andamento'),
(7, 7, '2026-10-14', '2026-10-21', 1, 'Em andamento'),
(8, 8, '2026-09-10', '2026-09-20', 2, 'Concluído');

-- 4. DEVOLUÇÕES
-- Os registros correspondem aos empréstimos acima.
INSERT INTO devolucoes
(emprestimo_id, data_devolucao, quantidade_devolvida, condicao)
VALUES
(5, '2026-10-15', 2, 'Bom estado'),
(6, '2026-09-28', 3, 'Bom estado'),
(10, '2026-09-19', 2, 'Bom estado');