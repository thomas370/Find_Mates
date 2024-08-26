const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewprofile')
        .setDescription('Permet de voir le profil de l\'utilisateur')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('L\'utilisateur dont vous voulez voir le profil')
                .setRequired(false)),
    async execute(interaction) {
        try {
            // Obtenir l'utilisateur mentionné ou celui qui a exécuté la commande
            const userOption = interaction.options.getUser('user');
            const targetUser = userOption || interaction.user;

            const discordId = targetUser.id;

            // Requête pour obtenir les informations du profil depuis la base de données
            const query = `
                SELECT u.discord_username AS discordUsername, g.game_username AS valorantUsername, g.game_tag AS valorantTag, g.rank
                FROM users u
                LEFT JOIN games g ON u.id = g.user_id AND g.game_name = 'Valorant'
                WHERE u.discord_id = ?
            `;

            global.database.query(query, [discordId], async (err, results) => {
                if (err) {
                    console.error('Erreur de récupération du profil :', err.message);
                    await interaction.reply({ content: 'Erreur de base de données. Veuillez réessayer plus tard.', ephemeral: true });
                    return;
                }

                if (results.length === 0) {
                    await interaction.reply({ content: `Le profil pour l'utilisateur ${targetUser.username} n'a pas été trouvé.`, ephemeral: true });
                    return;
                }

                const userProfile = results[0];

                // Créer l'embed avec les informations du profil de l'utilisateur
                const profileEmbed = new EmbedBuilder()
                    .setColor(0x1D82B6)
                    .setTitle(`Profil de ${userProfile.discordUsername}`)
                    .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: 'Nom d\'utilisateur Discord', value: userProfile.discordUsername, inline: true },
                        { name: 'Nom d\'utilisateur Valorant', value: userProfile.valorantUsername || 'Non spécifié', inline: true },
                        { name: 'Tag Valorant', value: userProfile.valorantTag || 'Non spécifié', inline: true },
                        { name: 'Rang', value: userProfile.rank || 'Non spécifié', inline: true }
                    )
                    .setFooter({ text: 'ValorantSetProfil utilisateur', iconURL: targetUser.displayAvatarURL({ dynamic: true }) })
                    .setTimestamp();

                // Répondre avec l'embed
                await interaction.reply({ embeds: [profileEmbed], ephemeral: true });
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Ooops... ! Je suis tombé dans les escaliers 🤕 Pouvez-vous réessayer ?', ephemeral: true });
        }
    }
};
