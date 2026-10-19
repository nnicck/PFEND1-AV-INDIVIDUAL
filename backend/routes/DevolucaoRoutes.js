import express from "express";

export function criarDevolucaoRoutes({ devolucaoController }) {
    const router = express.Router();

    router.get("/", devolucaoController.listar);
    router.get("/:id", devolucaoController.buscar);
    router.post("/", devolucaoController.criar);
    router.delete("/:id", devolucaoController.deletar);
    router.put("/:id", devolucaoController.atualizar);

    return router;
}