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
