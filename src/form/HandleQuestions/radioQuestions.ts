

//fonction pour répondre à une question radio de manière aléatoire
export async function answerRadioButtonQuestion(page, labelText: string) {
    try {
        // Sélecteur plus spécifique pour les boutons radio dans le formulaire LinkedIn
        const radioButtons = await page.$$('input[type="radio"].fb-form-element__checkbox');
        
        if (radioButtons.length > 0) {
            // Privilégier la réponse "Oui" si elle existe
            const yesButton = await page.$('input[type="radio"][value="Oui"]');
            if (yesButton) {
                await yesButton.evaluate(radio => {
                    if (radio instanceof HTMLElement) {
                        radio.click();
                    }
                });
                console.log(`Bouton radio "Oui" sélectionné pour "${labelText}"`);
                return;
            }
            
            // Sinon, sélection aléatoire
            const randomIndex = Math.floor(Math.random() * radioButtons.length);
            const selectedRadio = radioButtons[randomIndex];
            
            await selectedRadio.evaluate(radio => {
                if (radio instanceof HTMLElement) {
                    radio.click();
                }
            });
            
            console.log(`Bouton radio sélectionné aléatoirement : index ${randomIndex}`);
        } else {
            console.log('Aucun bouton radio trouvé');
        }
    } catch (error) {
        console.error('Erreur lors de la sélection du bouton radio :', error);
    }
}