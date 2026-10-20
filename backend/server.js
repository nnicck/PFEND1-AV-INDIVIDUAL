//Aqui vai ser o express
import { carregarAmbiente } from "./config/ambiente.js";

const config = carregarAmbiente(".env");

const { app } = await import("./app.js");

const porta = config.porta || 3001;

app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});                      