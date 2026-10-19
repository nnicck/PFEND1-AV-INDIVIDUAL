import express from "express";
import { criarPool } from "./config/database.js";

// Models
import { criarEquipamentoModel } from "./models/EquipamentoModel.js";
import { criarFuncionarioModel } from "./models/FuncionarioModel.js";
import { criarEmprestimoModel } from "./models/EmprestimoModel.js";
import { criarDevolucaoModel } from "./models/DevolucaoModel.js";

// Services
import { criarEquipamentoService } from "./services/EquipamentoService.js";
import { criarFuncionarioService } from "./services/FuncionarioService.js";
import { criarEmprestimoService } from "./services/EmprestimoService.js";
import { criarDevolucaoService } from "./services/DevolucaoService.js";

// Controllers
import { criarEquipamentoController } from "./controllers/EquipamentoController.js";
import { criarFuncionarioController } from "./controllers/FuncionarioController.js";
import { criarEmprestimoController } from "./controllers/EmprestimoController.js";
import { criarDevolucaoController } from "./controllers/DevolucaoController.js";

// Routes
import { criarEquipamentoRoutes } from "./routes/EquipamentoRoutes.js";
import { criarFuncionarioRoutes } from "./routes/FuncionarioRoutes.js";
import { criarEmprestimoRoutes } from "./routes/EmprestimoRoutes.js";
import { criarDevolucaoRoutes } from "./routes/DevolucaoRoutes.js";

export const app = express();

// Middleware para ler JSON
app.use(express.json());

const pool = criarPool();

// ==================== EQUIPAMENTOS ====================

const equipamentoModel = criarEquipamentoModel({ pool });
const equipamentoService = criarEquipamentoService({ equipamentoModel });
const equipamentoController = criarEquipamentoController({ equipamentoService });
const equipamentoRoutes = criarEquipamentoRoutes({ equipamentoController });

// ==================== FUNCIONÁRIOS ====================

const funcionarioModel = criarFuncionarioModel({ pool });
const funcionarioService = criarFuncionarioService({ funcionarioModel });
const funcionarioController = criarFuncionarioController({ funcionarioService });
const funcionarioRoutes = criarFuncionarioRoutes({ funcionarioController });

// ==================== EMPRÉSTIMOS ====================

const emprestimoModel = criarEmprestimoModel({ pool });
const emprestimoService = criarEmprestimoService({ emprestimoModel });
const emprestimoController = criarEmprestimoController({ emprestimoService });
const emprestimoRoutes = criarEmprestimoRoutes({ emprestimoController });

// ==================== DEVOLUÇÕES ====================

const devolucaoModel = criarDevolucaoModel({ pool });
const devolucaoService = criarDevolucaoService({ devolucaoModel });
const devolucaoController = criarDevolucaoController({ devolucaoService });
const devolucaoRoutes = criarDevolucaoRoutes({ devolucaoController });

// ==================== ROTAS ====================

// Teste do servidor
app.get("/api/check", (req, res) => {
    res.status(200).json({
        status: "ok",
        mensagem: "Servidor funcionando via HTTP"
    });
});

// Registrar as rotas
app.use("/api/equipamentos", equipamentoRoutes);
app.use("/api/funcionarios", funcionarioRoutes);
app.use("/api/emprestimos", emprestimoRoutes);
app.use("/api/devolucoes", devolucaoRoutes);

// Rota não encontrada
app.use((req, res) => {
    res.status(404).json({
        erro: `A rota ${req.method} ${req.originalUrl} não existe.`
    });
});

// Tratamento de erros
app.use((erro, req, res, _next) => {
    console.error(`Erro de sistema: ${erro.message}`);

    res.status(500).json({
        erro: "Falha interna do servidor"
    });
});