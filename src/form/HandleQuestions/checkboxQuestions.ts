

//fonction pour répondre à une question checkbox de manière aléatoire
export async function answerCheckboxQuestion(page, labelText: string) {
    try {
        const checkboxes = await page.$$('input[type="checkbox"]');
        if (checkboxes.length > 0) {
            // Sélectionne un nombre aléatoire de cases à cocher (entre 1 et le nombre total)
            const numToSelect = Math.floor(Math.random() * checkboxes.length) + 1;
            
            // Mélange le tableau des cases à cocher
            const shuffledCheckboxes = checkboxes.sort(() => Math.random() - 0.5);
            
            // Sélectionne les n premières cases
            for (let i = 0; i < numToSelect; i++) {
                await shuffledCheckboxes[i].evaluate(checkbox => {
                    if (checkbox instanceof HTMLElement) {
                        checkbox.click();
                    }
                });
            }
            
            console.log(`${numToSelect} cases à cocher sélectionnées aléatoirement`);
        } else {
            console.log('Aucune case à cocher trouvée');
        }
    } catch (error) {
        console.error('Erreur lors de la sélection des cases à cocher :', error);
    }
}