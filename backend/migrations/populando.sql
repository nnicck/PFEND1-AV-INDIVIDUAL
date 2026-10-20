-- =========================================
-- 1. FUNCIONÁRIOS
-- =========================================

INSERT INTO funcionarios (nome, cargo, setor, status_funcionarios)
VALUES
('Ana Silva', 'Técnica de Segurança', 'Segurança do Trabalho', 'Ativo'),
('Carlos Souza', 'Operador de Máquinas', 'Produção', 'Ativo'),
('Mariana Oliveira', 'Auxiliar de Produção', 'Produção', 'Ativo'),
('Pedro Santos', 'Eletricista', 'Manutenção', 'Ativo'),
('Juliana Costa', 'Supervisora', 'Logística', 'Ativo'),
('Rafael Lima', 'Mecânico', 'Manutenção', 'Inativo');


-- =========================================
-- 2. EQUIPAMENTOS
-- =========================================

INSERT INTO equipamentos
(nome, categoria, fabricante, maximo_equipamentos, qtd_disponivel)
VALUES
('Capacete de Segurança', 'Proteção da Cabeça', '3M', 50, 43),
('Luva de Proteção', 'Proteção das Mãos', 'Danny', 100, 82),
('Óculos de Proteção', 'Proteção dos Olhos', 'Carbografite', 60, 52),
('Protetor Auricular', 'Proteção Auditiva', '3M', 80, 68),
('Botina de Segurança', 'Proteção dos Pés', 'Marluvas', 40, 34),
('Máscara Respiratória', 'Proteção Respiratória', '3M', 30, 25);


-- =========================================
-- 3. EMPRÉSTIMOS
-- =========================================

INSERT INTO emprestimos
(funcionario_id, equipamento_id, data_emprestimo,
 data_prevista_devolucao, qtd_emprestimo, status)
VALUES
(1, 1, '2026-10-15', '2026-10-25', 2, 'Em andamento'),
(2, 2, '2026-10-10', '2026-10-18', 5, 'Atrasado'),
(3, 3, '2026-10-17', '2026-10-24', 2, 'Em andamento'),
(4, 5, '2026-10-01', '2026-10-08', 1, 'Devolvido'),
(5, 4, '2026-10-12', '2026-10-20', 3, 'Em andamento'),
(2, 6, '2026-10-05', '2026-10-12', 2, 'Devolvido'),
(1, 2, '2026-10-14', '2026-10-19', 3, 'Atrasado');


-- =========================================
-- 4. DEVOLUÇÕES
-- =========================================

INSERT INTO devolucoes
(emprestimo_id, data_devolucao, quantidade_devolvida, condicao)
VALUES
(4, '2026-10-07', 1, 'Bom estado'),
(6, '2026-10-11', 2, 'Bom estado');