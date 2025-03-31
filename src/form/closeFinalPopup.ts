import { Page } from "puppeteer";

//function to close the final popup after the form is submitted
export async function closeFinalPopup(page: Page) {
    try {
        // Attend que le modal apparaisse avec un timeout plus court
        await page.waitForSelector('[data-test-modal]', {
            visible: true,
            timeout: 5000
        });

        // Attendre un court instant pour s'assurer que le modal est complètement chargé
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Essayer plusieurs sélecteurs pour le bouton de fermeture
        const buttonSelectors = [
            'button.artdeco-button--primary',
            '[data-test-modal-close-btn]',
            'button[aria-label="Ignorer"]',
            'button[aria-label="Fermer"]'
        ];

        for (const selector of buttonSelectors) {
            const button = await page.$(selector);
            if (button) {
                await button.click();
                console.log(`Modal fermé avec succès via le sélecteur: ${selector}`);
                
                // Attendre que le modal disparaisse
                await page.waitForSelector('[data-test-modal]', {
                    hidden: true,
                    timeout: 3000
                }).catch(() => console.log("Le modal est peut-être toujours visible"));
                
                return;
            }
        }

        console.log("Aucun bouton de fermeture trouvé sur le modal");
    } catch (error) {
        console.log("Impossible de fermer le modal:", error.message);
    }
}
