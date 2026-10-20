export function criarDashboardController({ dashboardModel }) {
    async function buscarResumo(req, res) {
        try {
            const dados = await dashboardModel.buscarResumo();

            return res.status(200).json({
                sucesso: true,
                dados
            });
        } catch (erro) {
            console.error(erro);

            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao buscar resumo do dashboard."
            });
        }
    }

    return { buscarResumo };
}