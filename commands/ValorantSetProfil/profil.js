const { SlashCommandBuilder } = require('@discordjs/builders');
const getValorantRank = require('../../Utils/scrap_rank');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('valorantprofile')
        .setDescription('Set your Valorant profile')
        .addStringOption(option =>
            option.setName('valorant_name')
                .setDescription('Your Valorant name')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('valorant_tag')
                .setDescription('Your Valorant tag (e.g., #0420)')
                .setRequired(true)),
    async execute(interaction) {
        try {
            const valorantName = interaction.options.getString('valorant_name').replace(/ /g, '%20');
            const valorantTag = interaction.options.getString('valorant_tag').slice(1); // Enlève le '#'

            console.log(`Valorant name: ${valorantName}`);
            console.log(`Valorant tag: ${valorantTag}`);

            await interaction.deferReply({ content: "Chargement...", ephemeral: true });

            // Assume getValorantRank returns an object with rank only
            const rankValue = await getValorantRank(valorantName, valorantTag);

            const discordId = interaction.user.id;
            const discordUsername = interaction.user.username;
            const discordPhoto = interaction.user.displayAvatarURL();

            // Vérifie si l'utilisateur existe déjà dans la base de données
            global.database.query('SELECT id FROM users WHERE discord_id = ?', [discordId], (err, results) => {
                if (err) {
                    console.error('Erreur de requête SELECT :', err.message);
                    return;
                }

                if (results.length === 0) {
                    // Si l'utilisateur n'existe pas, insère les données de l'utilisateur et du jeu
                    global.database.query('INSERT INTO users (discord_id, discord_username, discord_photo) VALUES (?, ?, ?)',
                        [discordId, discordUsername, discordPhoto], (err, results) => {
                            if (err) {
                                console.error('Erreur de requête INSERT :', err.message);
                                return;
                            }

                            const userId = results.insertId; // Obtient l'ID de l'utilisateur inséré

                            global.database.query('INSERT INTO games (user_id, game_name, game_username, game_tag, rank) VALUES (?, ?, ?, ?, ?)',
                                [userId, 'Valorant', valorantName.replace(/%20/g, ' '), `#${valorantTag}`, rankValue], (err) => {
                                    if (err) {
                                        console.error('Erreur de requête INSERT (games) :', err.message);
                                        return;
                                    }

                                    interaction.editReply({
                                        content: `Votre profil a été créé avec le rang **${rankValue}**.`,
                                        ephemeral: true
                                    });
                                });
                        });
                } else {
                    // Si l'utilisateur existe déjà, met à jour les informations du jeu
                    const userId = results[0].id;

                    global.database.query('UPDATE games SET game_username = ?, game_tag = ?, rank = ? WHERE user_id = ? AND game_name = ?',
                        [valorantName.replace(/%20/g, ' '), `#${valorantTag}`, rankValue, userId, 'Valorant'], (err) => {
                            if (err) {
                                console.error('Erreur de requête UPDATE :', err.message);
                                return;
                            }

                            interaction.editReply({
                                content: `Votre profil a été mis à jour avec le rang **${rankValue}**.`,
                                ephemeral: true
                            });
                        });
                }
            });

        } catch (error) {
            console.error('Error occurred:', error.message);

            if (error.response) {
                console.log('API response error:', JSON.stringify(error.response.data, null, 2));
                console.log('Status code:', error.response.status);
                console.log('Headers:', JSON.stringify(error.response.headers, null, 2));
            } else if (error.request) {
                console.log('No response received:', JSON.stringify(error.request, null, 2));
            } else {
                console.log('Error setting up request:', error.message);
            }

            await interaction.editReply({
                content: 'Oops! Quelque chose s\'est mal passé. Veuillez réessayer plus tard.',
                ephemeral: true
            });
        }
    }
};
