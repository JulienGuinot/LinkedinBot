import puppeteer from 'puppeteer';
import { handleApplicationForm } from './src/form/apply';
import fs from 'fs';
import chalk from 'chalk';
import { lauchBrowser, logApplication, logJob, sendDiscordWebhookMessage, sendDiscordWebhookUpdates } from './src/other/utils';
import { extractJobInfo } from './src/scrap/job_details';
import { APPLICATIONS_LOG } from './src/other/utils';
import { filterEasyApply } from './src/filtering/filterOffers';
import { ErrorHandler } from './src/errors/errorHandler';
import { LinkedInBotError, ErrorCodes } from './src/errors/customError';
import { checkUrl } from './src/filtering/checkURL';
import { closeFinalPopup } from './src/form/closeFinalPopup';
import { goToNextPage } from './src/pagination/nextPage';
import { manageScroll } from './src/other/utils';
import { startupMessage } from './src/other/dialog';

startupMessage();

export const launchBot = async (url: string) => {
    const errorHandler = ErrorHandler.getInstance();

    const browser = await lauchBrowser();
    
    try {
        console.log(chalk.blue('🚀 Démarrage du script...'));
        
        // Créer le fichier CSV s'il n'existe pas
        if (!fs.existsSync(APPLICATIONS_LOG)) {
            console.log(chalk.yellow('📝 Création du fichier CSV de suivi...'));
            fs.writeFileSync(APPLICATIONS_LOG, 'Date,Titre,Entreprise,Localisation,Niveau d\'expérience,Compétences,Type de contrat,Candidats,Avantages\n');
        }

        console.log(chalk.blue('🌐 Lancement du navigateur...'));
        

        console.log('Création d\'une nouvelle page...');
        const page = await browser.newPage();
        await page.setViewport({ width: 1366, height: 768 });
        
        await page.setDefaultNavigationTimeout(15000);
        
        console.log('Navigation vers LinkedIn...');
        await page.goto(url);   

        await checkUrl(url, page);
        
        while (true) {
            try {
                console.log(chalk.blue('🔍 Recherche des offres d\'emploi sur la page...'));
                const jobs = await page.$$('.job-card-container');
                console.log(chalk.green(`📊 ${jobs.length} offres trouvées sur cette page`));
                
               for (const job of jobs) {
                    console.log(chalk.yellow(`\n📋 Analyse de l'offre ${jobs.indexOf(job) + 1}`));


                    try {
                        const jobInfo = await extractJobInfo(page);
                        if (!jobInfo) {
                            console.log('⚠️ Impossible d\'extraire les informations de l\'offre, passage à la suivante');
                            continue;
                        }
                    
                        const isEasyApply = await job.evaluate((element) => {
                            const footerItems = element.querySelectorAll('.job-card-container__footer-item span[dir="ltr"]');
                            return Array.from(footerItems).some(item => 
                                item.textContent?.trim() === 'Candidature simplifiée'
                            );
                        });

                        if (isEasyApply) {
                            console.log(chalk.green('✅ Offre "Candidature simplifiée" détectée'));
                            
                            // Click on the offer
                            await job.click();
                            console.log('Clic sur l\'offre effectué');
                            await new Promise(r => setTimeout(r, 2000));

                            // Rechercher et cliquer sur le bouton Postuler avec un sélecteur plus robuste
                            const applyButton = await page.waitForSelector(
                                ['button.jobs-apply-button', 'div.jobs-apply-button--top-card button', 'button[data-live-test-job-apply-button]'].join(','),
                                { timeout: 8000 }
                            ).catch(() => null);

                            if (applyButton) {
                                await applyButton.click();
                                await new Promise(r => setTimeout(r, 3000));
                                await handleApplicationForm(page);
                                logApplication(jobInfo);
                                logJob(jobInfo);
                                await sendDiscordWebhookUpdates(jobInfo);
                                await closeFinalPopup(page);
                            } else {
                                console.log('⚠️ Bouton Postuler non trouvé, passage à l\'offre suivante');
                            }
                        } else {
                            console.log(chalk.yellow('⚠️ Cette offre n\'est pas en candidature simplifiée'));
                        }
                    } catch (error) {
                        console.error(chalk.red(`❌ Erreur lors du traitement de l'offre ${job}:`, error));
                        continue;
                    }
                }

                const hasMoreJobs = await manageScroll(page);
                if (!hasMoreJobs) {
                    console.log('🏁 Plus d\'offres à charger, passage à la page suivante');
                    await goToNextPage(page);
                } else {
                    console.log('📑 Nouvelles offres chargées, continuation du traitement');
                    await new Promise(r => setTimeout(r, 2000)); // Attendre que tout soit bien chargé
                }
            } catch (error) {
                console.error(chalk.red('❌ Erreur lors du parcours de la page:', error));
                break;
            }
        }
    } catch (error) {
        await errorHandler.handleError(
            new LinkedInBotError(
                error.message,
                ErrorCodes.NAVIGATION,
                { url: url }
            ),
            'Initialisation du bot'
        );
        process.exit(1);
    } finally {
        console.log(chalk.blue('👋 Fermeture du navigateur...'));
        await browser.close();
        console.log(chalk.green('✨ Script terminé'));
    }
};






