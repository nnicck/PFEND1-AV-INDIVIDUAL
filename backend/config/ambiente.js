const nomeObrigatorios = ["PORT", "DB_HOST", "DB_PORT", "DB_USER", "DB_NAME"];
//DB_PASS ficará de fora, pois como usamos o XAMPP ou mysql sem configuração de segurança, a senha é ("") vazia

export function carregarAmbiente(arquivoDeConfiguracao){
    if(arquivoDeConfiguracao){
        try {
            process.loadEnvFile(arquivoDeConfiguracao);
        } catch {
            throw new Error(`Arquivo não encontrado: ${arquivoDeConfiguracao}`);
        }
    }

    const ausentes = nomeObrigatorios.filter((nome) => {
        const valor = process.env[nome];
        return typeof valor !== "string" || valor.trim() === "";
    });

    if(ausentes.length > 0){
        throw new Error(`Configure no .env ${ausentes.join(", ")}`);
    }

    return {
        porta: process.env.PORT,
        ambiente: process.env.NODE_ENV || "development"
    };
}
