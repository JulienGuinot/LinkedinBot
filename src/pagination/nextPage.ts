import { Page } from "puppeteer";


// go to the next page
export async function goToNextPage(page: Page) {
    try {
        // Attendre que le bouton soit visible
        await page.waitForSelector("button[aria-label='Voir la page suivante']", {
            visible: true,
            timeout: 5000
        });

        const nextButton = await page.$("button[aria-label='Voir la page suivante']");
        if (!nextButton) {
            const isDisabled = await page.$("button[aria-label='Voir la page suivante'][disabled]");
            if (isDisabled) {
                console.log('🏁 Dernière page atteinte');
                return false;
            }
            throw new Error("Bouton page suivante non trouvé");
        }

        await nextButton.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        return true;
    } catch (error) {
        console.error('❌ Erreur lors du passage à la page suivante:', error);
        return false;
    }
}
