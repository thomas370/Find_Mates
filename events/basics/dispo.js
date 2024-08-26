const { Events } = require('discord.js');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'toggleAvailability') {
            // Récupérer l'ID Discord de l'utilisateur
            const discordId = interaction.user.id;

            // Requête pour vérifier l'état actuel de disponibilité
            const querySelect = `
                SELECT g.available FROM games g
                JOIN users u ON u.id = g.user_id
                WHERE u.discord_id = ? AND g.game_name = 'Valorant'
            `;

            global.database.query(querySelect, [discordId], (err, results) => {
                if (err) {
                    console.error('Erreur de requête SELECT :', err.message);
                    interaction.reply({ content: 'Erreur lors de la récupération de votre disponibilité. Veuillez réessayer plus tard.', ephemeral: true });
                    return;
                }

                if (results.length === 0) {
                    interaction.reply({ content: 'Vous n\'avez pas encore de profil Valorant configuré.', ephemeral: true });
                    return;
                }

                // Récupère l'état de disponibilité actuel
                const currentAvailability = results[0].available;

                // Inverse l'état de disponibilité
                const newAvailability = !currentAvailability;

                // Mettre à jour la disponibilité dans la base de données
                const queryUpdate = `
                    UPDATE games g
                    JOIN users u ON u.id = g.user_id
                    SET g.available = ?
                    WHERE u.discord_id = ? AND g.game_name = 'Valorant'
                `;

                global.database.query(queryUpdate, [newAvailability, discordId], (err) => {
                    if (err) {
                        console.error('Erreur de requête UPDATE :', err.message);
                        interaction.reply({ content: 'Erreur lors de la mise à jour de votre disponibilité. Veuillez réessayer plus tard.', ephemeral: true });
                        return;
                    }

                    // Répond à l'utilisateur pour confirmer le changement
                    interaction.reply({
                        content: `Votre disponibilité a été mise à jour à **${newAvailability ? 'disponible' : 'non disponible'}**.`,
                        ephemeral: true
                    });
                });
            });
        }
    }
};