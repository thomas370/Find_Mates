const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
	name: 'ready',
	once: true,
	execute(client) {
		console.log(`Now come on, get to it as ${client.user.tag} ! 🚀`);
		global.slowModeMembers = [];
		
		global.database = mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASSWORD,
			database: process.env.DB_NAME
		});
		database.connect((error) => {
			if (error) throw error;
			console.log('Connected to the database ! 📡');
		});

		global.database = database;
	},
};