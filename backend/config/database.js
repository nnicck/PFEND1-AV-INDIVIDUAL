import mysql from "mysql2/promise";

export function criarPool(){
    return mysql.createPool({
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASS || "",
        database: process.env.DB_NAME,
        connectionLimit: 10, // limite de conexões simultâneas
        waitForConnections: true, // cria uma fila de novas requisições. será usado caso as 10 conexões simultâneas esteja efetivamente em uso, para não perder nenhuma requisição, se estiver falso, não ficará em fila
        queueLimit: 0 // tamanho da fila. quantas requisições ficarão aguardando as 10 finalizarem. usar 0 apenas em ambientes de teste, em produção, limitar a 30, 40, 50, dependendo do servidor
    })
}