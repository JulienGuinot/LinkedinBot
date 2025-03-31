import { JobData } from '../types/types';
import fs from 'fs';
import chalk from 'chalk';
import axios from 'axios';
import { extractJobInfo } from '../scrap/job_details';
import puppeteer, { Page } from 'puppeteer';

export const APPLICATIONS_LOG = './data/applications.csv';

// Fonction pour enregistrer une candidature
export const logApplication = (jobData: JobData) => {
    const timestamp = new Date().toISOString();
    const csvLine = `${timestamp},"${jobData.jobTitle}","${jobData.company}","${jobData.location}","${jobData.experienceLevel}","${jobData.skills}","${jobData.contractType}","${jobData.applicants}","${jobData.benefits}"\n`;
    fs.appendFileSync(APPLICATIONS_LOG, csvLine);
};


// Fonction pour créer un message Discord stylisé avec embed
export const createStyledMessage = (jobData: JobData) => {
    return {
        embeds: [{
            title: "🤖 Nouvelle candidature soumise",
            color: 0x00ff00, // Couleur verte
            fields: [
                {
                    name: "🔑 ID",
                    value: jobData.jobID,
                    inline: true
                },
                {
                    name: "📝 Poste",
                    value: jobData.jobTitle,
                    inline: true
                },
                {
                    name: "🏢 Entreprise",
                    value: jobData.company,
                    inline: true
                },
                {
                    name: "📍 Localisation",
                    value: jobData.location,
                    inline: true
                },{
                    name: "🔗 URL",
                    value: jobData.jobURL,
                    inline: true
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: "Bot de candidature LinkedIn"
            }
        }]
    };
};

// Fonction pour envoyer les mises à jour à Discord
export const sendDiscordWebhookUpdates = async (jobData: JobData) => {
    const webhookPayload = createStyledMessage(jobData);
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
        console.error(chalk.red('❌ URL du webhook non définie'));
        return;
    }

    try {
        await axios.post(webhookUrl, webhookPayload);
        console.log(chalk.green('✅ Message envoyé à Discord'));
    } catch (error) {
        console.error(chalk.red('❌ Erreur lors de l\'envoi du message Discord:', error));
    }
};

// Fonction pour envoyer les mises à jour à Discord
export const sendDiscordWebhookMessage = async (message: string) => {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
        console.error(chalk.red('❌ URL du webhook non définie'));
        return;
    }
    await axios.post(webhookUrl, { content: message });
};


//function for a random timeout
export const randomTimeout = async (min: number, max: number) => {
    const timeout = Math.floor(Math.random() * (max - min + 1)) + min;
    await new Promise(resolve => setTimeout(resolve, timeout));
};



export function logJob(jobInfo: JobData) {
    console.log(chalk.cyan(`📌 Détails de l'offre :
                            Titre: ${jobInfo.jobTitle}
                            Entreprise: ${jobInfo.company}
                            Localisation: ${jobInfo.location},
                            Niveau d\'expérience: ${jobInfo.experienceLevel},
                            Compétences: ${jobInfo.skills},
                            Type de contrat: ${jobInfo.contractType},
                            Candidats: ${jobInfo.applicants},
                            Avantages: ${jobInfo.benefits}`));
}




export async function lauchBrowser() {
    const browser = await puppeteer.launch({
        headless: false,
        args: [
            `--user-data-dir=${process.env.CHROME_PROFILE_PATH}`,
            '--start-maximized',
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--no-sandbox'
        ],
        defaultViewport: null,
        executablePath: process.env.CHROME_EXECUTABLE_PATH,
    });
    return browser;
};



///fonction cassée , à réparer
export async function manageScroll(page: Page) {
    try {
        console.log('🔄 Défilement de la page pour charger plus d\'offres...');
        
        // Hauteur initiale
        const initialHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        console.log(`📏 Hauteur initiale de la page: ${initialHeight}px`);
        
        // Identifier le conteneur des offres d'emploi
        const jobListSelector = '.jobs-search-results-list';
        
        // Vérifier si le sélecteur existe
        const jobListExists = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            console.log("Élément trouvé:", element);
            return !!element;
        }, jobListSelector);
        
        console.log(`🔍 Conteneur de liste d'emplois trouvé: ${jobListExists}`);
        
        if (!jobListExists) {
            console.log('⚠️ Sélecteur de liste d\'emplois non trouvé, tentative avec le document entier');
            
            // Faire défiler progressivement le document entier
            for (let i = 0; i < 5; i++) {
                await page.evaluate(() => {
                    window.scrollBy(0, 300);
                });
                console.log(`📜 Défilement #${i+1} effectué`);
                await new Promise(r => setTimeout(r, 1000));
            }
        } else {
            // Faire défiler spécifiquement le conteneur de liste d'emplois
            await page.evaluate((selector) => {
                const container = document.querySelector(selector);
                if (container) {
                    console.log(`Défilement du conteneur: ${selector}`);
                    container.scrollTop += 1000;
                }
            }, jobListSelector);
            console.log('📜 Défilement du conteneur de liste effectué');
            await new Promise(r => setTimeout(r, 2000));
            
            // Second défilement pour s'assurer du chargement
            await page.evaluate((selector) => {
                const container = document.querySelector(selector);
                if (container) {
                    container.scrollTop += 1000;
                }
            }, jobListSelector);
            console.log('📜 Second défilement effectué');
            await new Promise(r => setTimeout(r, 2000));
        }

        // Vérifier si de nouveaux éléments ont été chargés
        const newHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        console.log(`📏 Nouvelle hauteur de la page: ${newHeight}px`);
        
        const jobCards = await page.$$('.job-card-container, .jobs-search-results__list-item');
        console.log(`🔢 Nombre d'offres d'emploi trouvées: ${jobCards.length}`);
        
        if (newHeight > initialHeight || jobCards.length > 0) {
            console.log('✅ Nouvelles offres chargées avec succès');
            return true;
        }

        console.log('⚠️ Aucune nouvelle offre détectée après défilement');
        return false;
    } catch (error) {
        console.error('❌ Erreur lors du défilement :', error);
        return false;
    }
}
