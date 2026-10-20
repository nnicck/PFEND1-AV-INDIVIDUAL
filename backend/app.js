import express from "express";
import { criarPool } from "./config/database.js";
import cors from "cors";


// Models
import { criarFuncionarioModel } from "./models/FuncionarioModel.js";
import { criarEquipamentoModel } from "./models/EquipamentoModel.js";
import { criarEmprestimoModel } from "./models/EmprestimoModel.js";
import { criarDevolucaoModel } from "./models/DevolucaoModel.js";

// Services
import { criarFuncionarioService } from "./services/FuncionarioService.js";
import { criarEquipamentoService } from "./services/EquipamentoService.js";
import { criarEmprestimoService } from "./services/EmprestimoService.js";
import { criarDevolucaoService } from "./services/DevolucaoService.js";

// Controllers
import { criarFuncionarioController } from "./controllers/FuncionarioController.js";
import { criarEquipamentoController } from "./controllers/EquipamentoController.js";
import { criarEmprestimoController } from "./controllers/EmprestimoController.js";
import { criarDevolucaoController } from "./controllers/DevolucaoController.js";

// Routes
import { criarFuncionarioRoutes } from "./routes/FuncionarioRoutes.js";
import { criarEquipamentoRoutes } from "./routes/EquipamentosRoutes.js";
import { criarEmprestimoRoutes } from "./routes/EmprestimoRoutes.js";
import { criarDevolucaoRoutes } from "./routes/DevolucaoRoutes.js";

export const app = express();

// Middleware para ler JSON
app.use(express.json());

// Conexão com o banco de dados
const pool = criarPool();

// ==================== MODELS ====================

const funcionarioModel = criarFuncionarioModel({ pool });
const equipamentoModel = criarEquipamentoModel({ pool });
const emprestimoModel = criarEmprestimoModel({ pool });
const devolucaoModel = criarDevolucaoModel({ pool });

// ==================== SERVICES ====================


const funcionarioService = criarFuncionarioService({ funcionarioModel });
const equipamentoService = criarEquipamentoService({ equipamentoModel });
const emprestimoService = criarEmprestimoService({ emprestimoModel });
const devolucaoService = criarDevolucaoService({ devolucaoModel });

// ==================== CONTROLLERS ====================

const funcionarioController = criarFuncionarioController({ funcionarioService });
const equipamentoController = criarEquipamentoController({ equipamentoService });
const emprestimoController = criarEmprestimoController({ emprestimoService });
const devolucaoController = criarDevolucaoController({ devolucaoService });

// ==================== ROUTES ====================

const funcionarioRoutes = criarFuncionarioRoutes({ funcionarioController });
const equipamentoRoutes = criarEquipamentoRoutes({ equipamentoController });
const emprestimoRoutes = criarEmprestimoRoutes({ emprestimoController });
const devolucaoRoutes = criarDevolucaoRoutes({ devolucaoController });

// Teste do servidor
app.get("/api/check", (req, res) => {
    res.status(200).json({
        status: "ok",
        mensagem: "Servidor funcionando via HTTP"
    });
});

app.use(cors({
    origin: "http://localhost:3000"
}));

app.use(express.json());

// Registro das rotas
app.use("/api/funcionarios", funcionarioRoutes);
app.use("/api/equipamentos", equipamentoRoutes);
app.use("/api/emprestimos", emprestimoRoutes);
app.use("/api/devolucoes", devolucaoRoutes);

// Rota não encontrada
app.use((req, res) => {
    res.status(404).json({
        erro: `A rota ${req.method} ${req.originalUrl} não existe.`
    });
});

// Tratamento de erros
app.use((erro, req, res, next) => {
    console.error(`Erro de sistema: ${erro.message}`);

    res.status(500).json({
        erro: "Falha interna do servidor"
    });
});
