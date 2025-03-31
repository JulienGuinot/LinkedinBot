import chalk from 'chalk';
import { JobData } from '../types/types';
import { Page } from 'puppeteer';

// Fonction pour extraire les informations de l'offre
export const extractJobInfo = async (page: Page) => {
    try {
        const jobID = await page.$eval('div[data-job-id]', el => el.getAttribute('data-job-id') || '');

        const jobURL = await page.$eval('h1.t-24.t-bold.inline a', el => el.getAttribute('href') || '');

        const jobTitle = await page.$eval('h1.t-24.t-bold.inline a', el => el.textContent?.trim() || '');
        
        const company = await page.$eval('div.job-details-jobs-unified-top-card__company-name a', el => el.textContent?.trim() || '');

        const location = await page.$eval('div.t-black--light.mt2 span.tvm__text.tvm__text--low-emphasis:first-of-type', el => el.textContent?.trim() || '');

        const experienceLevel = await page.$eval('li.job-details-jobs-unified-top-card__job-insight--highlight span[dir="ltr"]', el => el.textContent?.trim() || '');

        const skills = await page.$eval('button.job-details-jobs-unified-top-card__job-insight-text-button', el => el.textContent?.trim() || '');

        // Extraction du type de contrat
        const contractTypeElements = await page.$$('span.ui-label--accent-3');
        let contractType = 'Non spécifié';
        for (const element of contractTypeElements) {
            const text = await (await element.getProperty('textContent')).jsonValue() as string;
            if (text.includes('Hybride') || text.includes('Temps plein')) {
                contractType = text.trim();
                break;
            }
        }

        const description = await page.$eval('div#job-details', el => el.textContent?.trim() || '');

        // Extraction du nombre de candidats
        const applicantElements = await page.$$('span.tvm__text.tvm__text--low-emphasis');
        let applicants = 'Non spécifié';
        for (const element of applicantElements) {
            const text = await (await element.getProperty('textContent')).jsonValue() as string;
            if (text.includes('candidats')) {
                applicants = text.trim();
                break;
            }
        }

        const benefits = await page.$eval('div.jobs-description__details', el => el.textContent?.trim() || '').catch(() => 'Non spécifié');

        return {
            jobID,
            jobURL,
            jobTitle,
            company,
            location,
            experienceLevel,
            skills: skills.split(':')[1],
            contractType,
            description,
            applicants,
            benefits
        };
    } catch (error) {
        console.error('Erreur lors de l\'extraction des informations :', error);
        return null;
    }
};
