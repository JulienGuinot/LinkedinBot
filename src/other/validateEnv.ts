const chalk = require('chalk')

const validateEnv = () => {

    console.log(chalk.green('🔍 Validation de l\'environnement... \n'));

    if (!process.env.DISCORD_WEBHOOK_URL) {
        console.error(chalk.red('❌ URL du webhook non définie'));
        return;
    }
    if (!process.env.CHROME_EXECUTABLE_PATH) {
        console.error(chalk.red('❌ CHEMIN de l\'éxécutable chrome non défini'));
        return;
    }
    if (!process.env.CHROME_PROFILE_PATH) {
        console.error(chalk.red('❌ CHEMIN du profil chrome non défini'));
        return;
    }
    if (!process.env.DEFAULT_EXPERIENCE_LEVEL) {
        console.error(chalk.red('❌ NIVEAU D\'EXPERIENCE par défaut non défini'));
        return;
    }
    if (!process.env.LAST_NAME) {
        console.error(chalk.red('❌ NOM par défaut non défini'));
        return;
    }
    if (!process.env.FIRST_NAME) {
        console.error(chalk.red('❌ PRENOM par défaut non défini'));
        return;
    }

    console.log(chalk.green('✅ Validation de l\'environnement réussie \n'));
    return;
};

export default validateEnv;
