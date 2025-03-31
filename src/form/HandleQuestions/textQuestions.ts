
//function to answer the text question
export async function answerTextQuestion(page, labelText: string) {
    try {
        // Recherche du champ texte spécifique en utilisant le label
        const textInput = await page.evaluateHandle((labelText) => {
            // Recherche d'abord par l'attribut "for" du label
            const label = Array.from(document.querySelectorAll('label')).find(
                label => label.textContent?.toLowerCase().includes(labelText.toLowerCase())
            );
            if (label && label.getAttribute('for')) {
                const forAttribute = label.getAttribute('for');
                if (forAttribute) {
                    return document.getElementById(forAttribute);
                }
            }
            
            // Si pas trouvé, recherche par aria-label
            const inputByAria = document.querySelector(`input[type="text"][aria-label*="${labelText}"]`);
            if (inputByAria) return inputByAria;
            
            // Si toujours pas trouvé, chercher le champ texte le plus proche du label
            if (label) {
                const input = label.parentElement?.querySelector('input[type="text"]');
                if (input) return input;
            }
            
            // En dernier recours, retourner le premier champ texte required vide
            return document.querySelector('input[type="text"][required]:not([value])');
        }, labelText);

        if (textInput) {
            // Génération d'une réponse appropriée basée sur le label
            const answer = determineAnswer(labelText);

            await textInput.type(answer);
            console.log(`Réponse saisie pour "${labelText}" : ${answer}`);
        } else {
            console.log(`Champ de texte non trouvé pour le label : ${labelText}`);
        }
    } catch (error) {
        console.error('Erreur lors de la saisie du texte:', error);
    }
}




const determineAnswer = (labelText: string) => {
    if (labelText.toLowerCase().includes('nom') || labelText.toLowerCase().includes('last name')) {
        return process.env.LAST_NAME;
    } else if (labelText.toLowerCase().includes('prénom') || labelText.toLowerCase().includes('first name')) {
        return process.env.FIRST_NAME;
    } else if (labelText.toLowerCase().includes('email') || labelText.toLowerCase().includes('email address')) {
        return process.env.EMAIL;
    } else if (labelText.toLowerCase().includes('téléphone') || labelText.toLowerCase().includes('phone number')) {
        return process.env.PHONE_NUMBER;
    }
    else if (labelText.toLowerCase().includes('year') || labelText.toLowerCase().includes('years') || labelText.toLowerCase().includes('années') || labelText.toLowerCase().includes('année') || labelText.toLowerCase().includes('nombre') || labelText.toLowerCase().includes('éxpé') || labelText.toLowerCase().includes('nombre d\'années d\'expérience') || labelText.toLowerCase().includes('expérience'))  {
        return process.env.DEFAULT_EXPERIENCE_LEVEL;
    }
    return "placeholder";
}
