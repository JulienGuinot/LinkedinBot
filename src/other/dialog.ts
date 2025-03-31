import chalk from 'chalk';
import { launchBot } from '../../main';
const fs = require('fs');
import validateEnv from './validateEnv';
import {Debug} from "../../debug"
const LINKEDIN_URL1 = 'https://www.linkedin.com/jobs/recommended';




export async function startupMessage() {
    console.log("\n")

    console.log(chalk.cyan(`Bienvenue sur le bot LinkedIn.`))
    console.log(chalk.blue(`Ce bot vous permet de rechercher de offres d'emploi et de candidater à des offres simplifiées.`))
    console.log(chalk.yellow(`Il vous permet également de suivre les statistiques de vos candidatures. \n`))

    //to implement
    const Instructions = `Instructions creation cv ***`

    // Validation de l'environnement
    validateEnv();

    try {
        const resume = fs.readFileSync('resume.json', 'utf8');
        if (!resume) {
            console.log(chalk.red(Instructions))
        }
        console.log(chalk.green(`Votre CV a été trouvé. \n`))
    } catch (err) {
        console.error(chalk.red(Instructions))
    }
    


    const answer = await prompt(`Choisissez une option ci dessous \n
1. Lancer le bot sur vos jobs recommandés
2. Lancer le bot avec une recherche spécifique
3. (BETA)Configurer les filtres
4. Debug (Dev only)
5. Quitter le script\n \n \n`);
    if (answer === "1") {
        launchBot(LINKEDIN_URL1);
    } else if (answer === "2") {
        const search = await prompt("Entrez votre recherche comme ceci (exemple : stage marketing, paris)")
        if (!search) {
            console.log(chalk.red(`Veuillez entrer une recherche valide.`))
            process.exit(0);
        }
        const location = search.split(",")[1].trim()
        const job = search.split(",")[0].trim()
        const search_string = job.replace(" ", "+")

        launchBot("https://www.linkedin.com/jobs/search?keywords=" + search_string + "&location=" + location)

         
    } else if (answer === "3") {
        console.log(chalk.blue(`Le mode BETA est en cours de développement.`))
        process.exit(0);

    } else if (answer === "4") {
        console.log(chalk.blue("Debug started"))
        await Debug()
    
    } else if (answer === "5") {
        console.log(chalk.cyan(`Merci pour votre utilisation du bot des candidatures simplifiées de LinkedIn.`))
        process.exit(0);
    }
}