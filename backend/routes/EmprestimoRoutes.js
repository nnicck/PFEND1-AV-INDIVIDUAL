
import express from "express";

export function criarEmprestimoRoutes({ emprestimoController }) {
    const router = express.Router();

    router.get("/", emprestimoController.listar);
    router.get("/:id", emprestimoController.buscar);
    router.post("/", emprestimoController.criar);
    router.delete("/:id", emprestimoController.deletar);
    router.put("/:id", emprestimoController.atualizar);

    return router;
}
