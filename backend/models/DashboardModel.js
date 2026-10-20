export function criarDashboardModel({ pool }) {
    async function buscarResumo() {
        const [resultado] = await pool.query(`
            SELECT
                (
                    SELECT COALESCE(SUM(qtd_equipamentos), 0)
                    FROM equipamentos
                ) AS totalEpis,

                (
                    SELECT COALESCE(SUM(qtd_disponivel), 0)
                    FROM equipamentos
                ) AS disponivel,

                (
                    SELECT COUNT(*)
                    FROM emprestimos
                    WHERE status = 'Em andamento'
                ) AS emprestimosAtivos,

                (
                    SELECT COUNT(*)
                    FROM emprestimos
                    WHERE status = 'Atrasado'
                ) AS devolucoesAtrasadas
        `);

        return resultado[0];
    }

    return { buscarResumo };
}