-- 1. FUNCIONÁRIOS
INSERT INTO funcionarios (nome, cargo, setor, status_funcionarios) VALUES
('João Silva', 'Operador de máquinas', 'Produção', 'Ativo'),
('Maria Santos', 'Técnica de segurança', 'Segurança do Trabalho', 'Ativo'),
('Carlos Oliveira', 'Eletricista', 'Manutenção', 'Ativo'),
('Ana Souza', 'Auxiliar de produção', 'Produção', 'Ativo'),
('Pedro Costa', 'Mecânico industrial', 'Manutenção', 'Ativo');


-- 2. EQUIPAMENTOS
INSERT INTO equipamentos
(nome, categoria, fabricante, maximo_equipamentos, qtd_disponivel) VALUES
('Capacete de segurança', 'Proteção da cabeça', '3M', 20, 20),
('Luva de proteção', 'Proteção das mãos', 'Danny', 30, 30),
('Óculos de proteção', 'Proteção dos olhos', 'Delta Plus', 25, 25),
('Protetor auricular', 'Proteção auditiva', '3M', 20, 20),
('Botina de segurança', 'Proteção dos pés', 'Marluvas', 15, 15);


-- 3. EMPRÉSTIMOS
INSERT INTO emprestimos
(funcionario_id, equipamento_id, data_emprestimo,
 data_prevista_devolucao, qtd_emprestimo, status) VALUES
(1, 1, '2026-10-14', '2026-10-21', 2, 'Em andamento'),
(2, 3, '2026-10-15', '2026-10-22', 1, 'Em andamento'),
(3, 2, '2026-10-10', '2026-10-17', 3, 'Atrasado'),
(4, 4, '2026-10-16', '2026-10-23', 2, 'Em andamento'),
(5, 5, '2026-10-01', '2026-10-08', 1, 'Devolvido');


-- 4. DEVOLUÇÕES
INSERT INTO devolucoes
(emprestimo_id, data_devolucao, quantidade_devolvida) VALUES
(1, '2026-10-17', 1),
(2, '2026-10-18', 1),
(3, '2026-10-18', 1),
(4, '2026-10-19', 1),
(5, '2026-10-08', 1);