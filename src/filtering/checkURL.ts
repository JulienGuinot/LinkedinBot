import chalk from 'chalk';
import { Page } from 'puppeteer';
import { filterEasyApply } from './filterOffers';



// function to check that the script will execute on the right url
export async function checkUrl(url: string, page: Page) {
    if (!url.includes('jobs/recommended') && !url.includes('jobs/search')) {
        console.log(chalk.red('❌ Le script ne peut être exécuté sur cette page'));
        return false;
    }
    if (url.includes('jobs/search')) {
        await filterEasyApply(page);
        return true;
    }
    return true;
};


