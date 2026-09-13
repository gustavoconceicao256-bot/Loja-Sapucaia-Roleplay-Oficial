const config = require("../../Dados/config.json");

async function getFiveMStatus() {
    if (!config.servidor.ip) {
        return {
            online: false,
            players: 0,
            maxPlayers: 0,
            hostname: config.servidor.nome
        };
    }

    try {
        const response = await fetch(
            `http://${config.servidor.ip}/dynamic.json`,
            {
                signal: AbortSignal.timeout(5000)
            }
        );

        if (!response.ok) {
            throw new Error("Servidor indisponível");
        }

        const data = await response.json();

        return {
            online: true,
            players: Number(data.clients) || 0,
            maxPlayers: Number(data.sv_maxclients) || 0,
            hostname: data.hostname || config.servidor.nome
        };

    } catch (error) {
        return {
            online: false,
            players: 0,
            maxPlayers: 0,
            hostname: config.servidor.nome
        };
    }
}

module.exports = {
    getFiveMStatus
};
