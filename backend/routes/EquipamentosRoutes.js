
import express from "express";

export function criarEquipamentoRoutes({ equipamentoController }) {
    const router = express.Router();

    router.get("/", equipamentoController.listar);
    router.get("/:id", equipamentoController.buscar);
    router.post("/", equipamentoController.criar);
    router.delete("/:id", equipamentoController.deletar);
    router.put("/:id", equipamentoController.atualizar);

    return router;
}
