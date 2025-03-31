import chalk from "chalk";

export const unsubscribeCompany = async (page) => {
    try {
        console.log('🔍 Recherche de la case à cocher d\'abonnement...');
        
        // Attendre que la case à cocher soit présente dans le DOM
        const followCompanyCheckbox = await page.waitForSelector('#follow-company-checkbox', {
            timeout: 5000
        });

        if (followCompanyCheckbox) {
            console.log('✓ Case à cocher trouvée');
            
            // Vérifier si la case est cochée
            const isChecked = await page.evaluate(() => {
                const checkbox = document.querySelector('#follow-company-checkbox') as HTMLInputElement;
                return checkbox ? checkbox.checked : false;
            });

            if (isChecked) {
                // Cliquer sur le label plutôt que directement sur la checkbox
                await page.evaluate(() => {
                    const label = document.querySelector('label[for="follow-company-checkbox"]');
                    if (label) {
                        (label as HTMLElement).click();
                    }
                });
                console.log('✅ Désabonnement effectué');
            } else {
                console.log('ℹ️ Déjà désabonné');
            }
        }
    } catch (error) {
        if (error.name === 'TimeoutError') {
            console.log('⚠️ Case à cocher d\'abonnement non trouvée');
        } else {
            console.error('❌ Erreur lors du désabonnement:', error);
        }
    }
};
