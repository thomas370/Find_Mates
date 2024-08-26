const { SlashCommandBuilder } = require('@discordjs/builders');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche toutes les commandes disponibles'),
    async execute(interaction) {
        try {
            // Liste des commandes
            const commands = [
                {
                    name: '/valorantprofile',
                    description: 'Définir votre profil Valorant avec votre nom, tag et rang.'
                },
                {
                    name: '/search',
                    description: 'Rechercher des joueurs en fonction de leur rang et du nombre de mates souhaités. rank : bronze, silver, gold, platinum, diamond, immortal, radiant'
                },
                {
                    name: '/viewprofile',
                    description: 'Voir le profil Valorant d\'un utilisateur spécifique ou le vôtre.'
                },
                {
                    name: '/dispo',
                    description: 'Crée un bouton pour changer la disponibilité des joueurs.'
                },
                {
                    name: '/help',
                    description: 'Afficher la liste de toutes les commandes disponibles.'
                }
            ];

            // Construire le message de réponse
            let helpMessage = '**Voici la liste des commandes disponibles :**\n';
            commands.forEach(command => {
                helpMessage += `\n**${command.name}**: ${command.description}`;
            });

            // Répondre avec le message d'aide
            await interaction.reply({ content: helpMessage, ephemeral: true });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Ooops... ! Je suis tombé dans les escaliers 🤕 Pouvez-vous réessayer ?', ephemeral: true });
        }
    }
};