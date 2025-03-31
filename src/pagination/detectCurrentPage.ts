import { Page } from "puppeteer";



// detect the actual page 
export async function detectCurrentPage(page: Page): Promise<number | null> {
    const pageState = await page.$(".jobs-search-pagination__page-state");
    if (pageState) {
        const text = await page.evaluate(element => element.textContent, pageState);
        if (!text) {
            console.log("Impossible de trouver la page actuelle");
            return null;
        }
        // Extrait le numéro de page du format "Page X sur Y"
        const match = text.match(/Page (\d+)/);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    console.log("Impossible de trouver la page actuelle");
    return null;
}


export async function detectTotalPages(page: Page): Promise<number | null> {
    const pageState = await page.$(".jobs-search-pagination__page-state");
    if (pageState) {
        const text = await page.evaluate(element => element.textContent, pageState);
        if (!text) {
            console.log("Impossible de trouver le nombre total de pages");
            return null;
        }
        // Extrait le nombre total de pages du format "Page X sur Y"
        const match = text.match(/sur (\d+)/);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    console.log("Impossible de trouver le nombre total de pages");
    return null;
}


