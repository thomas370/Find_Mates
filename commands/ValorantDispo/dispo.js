const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dispo')
        .setDescription('Crée un bouton pour changer la disponibilité des joueurs'),
    async execute(interaction) {
        // Créer un bouton "Changer disponibilité"
        const availabilityButton = new ButtonBuilder()
            .setCustomId('toggleAvailability') // Identifiant unique pour le bouton
            .setLabel('Changer disponibilité')
            .setStyle(ButtonStyle.Primary);

        // Ajouter le bouton dans une rangée d'actions
        const row = new ActionRowBuilder().addComponents(availabilityButton);

        // Envoyer le message avec le bouton
        await interaction.reply({
            content: 'Cliquez sur le bouton ci-dessous pour changer votre disponibilité.',
            components: [row],
            ephemeral: true
        });
    }
};