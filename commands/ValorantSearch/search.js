const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder } = require('discord.js');
const getValorantRank = require('../../Utils/scrap_rank');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('Recherchez des joueurs avec un certain rang et nombre de mates')
        .addStringOption(option =>
            option.setName('game')
                .setDescription('Sélectionnez le jeu pour la recherche')
                .setRequired(true)
                .addChoices(
                    { name: 'Valorant', value: 'Valorant' },
                ))
        .addStringOption(option =>
            option.setName('rank')
                .setDescription('Sélectionnez le rang avec lequel vous voulez jouer')
                .setRequired(true)
                .addChoices(
                    { name: 'Iron', value: 'iron' },
                    { name: 'Bronze', value: 'bronze' },
                    { name: 'Silver', value: 'silver' },
                    { name: 'Gold', value: 'gold' },
                    { name: 'Platinum', value: 'platinum' },
                    { name: 'Diamond', value: 'diamond' },
                    { name: 'Immortal', value: 'immortal' },
                    { name: 'Radiant', value: 'radiant' }
                ))
        .addStringOption(option =>
            option.setName('numbermates')
                .setDescription('Sélectionnez le nombre de mates que vous recherchez')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const gameOption = interaction.options.getString('game').trim();
            const rankOption = interaction.options.getString('rank').trim().toLowerCase();
            const numberMatesOption = parseInt(interaction.options.getString('numbermates').trim());
            const discordId = interaction.user.id;

            await interaction.deferReply({ content: "Chargement...", ephemeral: true });

            const getUserQuery = `
                SELECT game_username AS valorantName, game_tag AS valorantTag, rank
                FROM games
                WHERE user_id = (
                    SELECT id FROM users WHERE discord_id = ?
                ) AND game_name = ?
            `;



            global.database.query(getUserQuery, [discordId, gameOption], async (err, results) => {
                if (err) {
                    console.error('Erreur de récupération des informations du joueur :', err.message);
                    await interaction.editReply({ content: 'Erreur de base de données. Veuillez réessayer plus tard.', ephemeral: true });
                    return;
                }

                if (results.length === 0) {
                    await interaction.editReply({ content: 'Aucune information de jeu trouvée pour vous. Veuillez vérifier vos paramètres.', ephemeral: true });
                    return;
                }

                const { valorantName, valorantTag, rank: currentRank } = results[0];

                // If the rank is outdated, update it
                if (currentRank !== rankOption) {
                    const newRank = await getValorantRank(valorantName, valorantTag);
                    const updateRankQuery = `
                        UPDATE games 
                        SET rank = ? 
                        WHERE game_name = ? AND user_id = (
                            SELECT id FROM users WHERE discord_id = ?
                        );
                    `;
                    global.database.query(updateRankQuery, [newRank, gameOption, discordId], (err) => {
                        if (err) {
                            console.error('Erreur de mise à jour du rang :', err.message);
                        }
                    });
                }

                // Rechercher les joueurs disponibles
                const searchQuery = `
                    SELECT u.discord_id, u.discord_username, u.discord_photo, g.game_username, g.game_tag, g.rank 
                    FROM users u 
                    JOIN games g ON u.id = g.user_id 
                    WHERE g.rank LIKE ? AND g.game_name = ? AND g.available = true 
                    LIMIT ?;
                `;

                global.database.query(searchQuery, [`${rankOption}%`, gameOption, numberMatesOption], async (err, results) => {
                    if (err) {
                        console.error('Erreur de requête SELECT :', err.message);
                        await interaction.editReply({ content: 'Erreur de base de données. Veuillez réessayer plus tard.', ephemeral: true });
                        return;
                    }

                    if (results.length === 0) {
                        await interaction.editReply({ content: `Aucun joueur disponible trouvé avec un rang "${rankOption}" pour le jeu "${gameOption}".`, ephemeral: true });
                        return;
                    }

                    const searchEmbed = new EmbedBuilder()
                        .setColor(0x1D82B6)
                        .setTitle(`Joueurs disponibles trouvés avec le rang "${rankOption}" pour "${gameOption}"`)
                        .setTimestamp();

                    for (const user of results) {
                        searchEmbed.addFields([
                            { name: 'Nom d\'utilisateur Discord', value: user.discord_username, inline: true },
                            { name: 'Nom d\'utilisateur', value: user.game_username || 'Non spécifié', inline: true },
                            { name: 'Tag', value: user.game_tag || 'Non spécifié', inline: true },
                            { name: 'Rang', value: user.rank || 'Non spécifié', inline: true },
                        ]);

                        if (user.discord_photo) {
                            searchEmbed.setThumbnail(user.discord_photo);
                        }

                        searchEmbed.addFields({ name: '\u200B', value: '\u200B' });
                    }

                    await interaction.editReply({ embeds: [searchEmbed], ephemeral: true });
                });
            });

        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: 'Ooops... ! Quelque chose s\'est mal passé. Pouvez-vous réessayer ?', ephemeral: true });
        }
    }
};
