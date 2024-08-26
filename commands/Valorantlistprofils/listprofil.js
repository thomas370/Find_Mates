const { SlashCommandBuilder } = require('@discordjs/builders');

// Utiliser la connexion globale
const connection = global.database;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listprofil')
        .setDescription('Affiche tous les profils enregistrés.'),
    async execute(interaction) {
        try {
            const query = `
        SELECT users.discord_username, users.discord_id, users.discord_photo, 
               games.game_name, games.game_username, games.game_tag, games.rank, games.available
        FROM users
        LEFT JOIN games ON users.id = games.user_id;
      `;

            // Exécuter la requête SQL
            connection.query(query, (error, results) => {
                if (error) {
                    console.error('Erreur lors de la récupération des profils:', error);
                    return interaction.reply('Une erreur est survenue lors de la récupération des profils.');
                }

                if (results.length === 0) {
                    return interaction.reply('Aucun profil n\'est enregistré.');
                }

                const profileListEmbed = {
                    color: 0x0099ff,
                    title: 'Liste des Profils',
                    fields: [],
                    timestamp: new Date(),
                    footer: {
                        text: 'Valorant Bot',
                    },
                };

                results.forEach(profile => {
                    profileListEmbed.fields.push({
                        name: `${profile.discord_username} (${profile.game_username}#${profile.game_tag})`,
                        value: `**Rank :** ${profile.rank}\n**Disponible :** ${profile.available ? 'Oui' : 'Non'}`,
                        inline: true,
                    });
                });

                interaction.reply({ embeds: [profileListEmbed] });
            });
        } catch (error) {
            console.error('Erreur lors de l\'exécution de la commande listprofil :', error);
            interaction.reply('Une erreur est survenue lors de l\'exécution de la commande.');
        }
    },
};
