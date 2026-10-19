import express from "express";

export function criarFuncionarioRoutes({ funcionarioController }) {
    const router = express.Router();

    router.get("/", funcionarioController.listar);
    router.get("/:id", funcionarioController.buscar);
    router.post("/", funcionarioController.criar);
    router.delete("/:id", funcionarioController.deletar);
    router.put("/:id", funcionarioController.atualizar);

    return router;
}