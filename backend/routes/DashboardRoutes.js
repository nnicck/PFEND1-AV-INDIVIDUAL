import { Router } from "express";

export function criarDashboardRoutes({ dashboardController }) {
    const router = Router();

    router.get("/resumo", dashboardController.buscarResumo);

    return router;
}