// Filter the jobs offers by 'Easy Apply'

import chalk from "chalk";
import { Page } from "puppeteer";
import { randomTimeout } from "../other/utils";


const seeAllFilters = async (page: Page) => {
    console.log(chalk.blue('🔍 Recherche du bouton "Afficher tous les filtres"...'));
    const seeAllFiltersButton = await page.$('button[aria-label="Afficher tous les filtres. En cliquant sur ce bouton, toutes les options de filtres disponibles apparaîtront."]');
    if (seeAllFiltersButton) {
        await seeAllFiltersButton.click();
        console.log(chalk.green('🎯 Bouton "Afficher tous les filtres" trouvé'));
        await randomTimeout(1000, 1500);
    }
    else {
        console.log(chalk.red('❌ Bouton "Afficher tous les filtres" non trouvé'));
    }
};


const clickEasyApplyFilter = async (page: Page) => {
    console.log(chalk.blue('🔍 Recherche du filtre "Easy Apply"...'));
    const easyApplyFilter = await page.$('input[data-artdeco-toggle-button="true"]');
    if (easyApplyFilter) {
        await easyApplyFilter.click();
        console.log(chalk.green('🎯 Filtre "Easy Apply" activé'));
    }
    else {
        console.log(chalk.red('❌ Filtre "Easy Apply" non trouvé'));
    }
};


const displayResults = async (page: Page) => {
    console.log(chalk.blue('🔍 Recherche du bouton "Afficher les résultats"...'));
    const displayResultsButton = await page.$('button[data-test-reusables-filters-modal-show-results-button="true"]');
    if (displayResultsButton) {
        await displayResultsButton.click();
        console.log(chalk.green('🎯 Bouton "Afficher les résultats" trouvé - Cliquer...'));
        await randomTimeout(1000, 1500);
    }
    else {
        console.log(chalk.red('❌ Bouton "Afficher les résultats" non trouvé'));
    }
};


export const filterEasyApply = async (page: Page) => {
    await seeAllFilters(page);
    await clickEasyApplyFilter(page);
    await displayResults(page);
    await randomTimeout(1000, 1500);
    console.log(chalk.green('✅ Filtre Easy Apply activé'));
};