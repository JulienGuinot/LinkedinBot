import chalk from "chalk";

//function to determine what type of question it is
export async function determineQuestionType(page, labelText: string) {
    try {
        // Recherche tous les éléments du formulaire associés à ce label
        const formElements = await page.evaluate((labelText) => {
            const label = Array.from(document.querySelectorAll('label')).find(
                label => label.textContent?.toLowerCase().includes(labelText.toLowerCase())
            );
            
            if (!label) {
                console.error('Aucun label trouvé');
                return null;
            } 
            
            const formElement = label.parentElement?.querySelector('input, select, textarea');
            if (!formElement) return null;
            
            return {
                type: formElement.tagName.toLowerCase(),
                inputType: formElement instanceof HTMLInputElement ? formElement.type : null
            };
        }, labelText);

        if (!formElements) return null;

        // Détermination du type de question
        if (formElements.inputType === 'radio') {
            console.log(chalk.green("Question radio trouvée"));
            return 'radio';
        } 
        else if (formElements.inputType === 'checkbox') {
            console.log(chalk.green('Checkbox trouvé'));
            return 'checkbox';
        }
        else if (formElements.type === 'select') {
            console.log(chalk.green("Question select trouvée"));
            return 'select';
        }
        else if (formElements.inputType === 'text' || formElements.type === 'textarea') {
            console.log(chalk.green("Question textuelle trouvée"));
            return 'text';
        }
        
        return null;
    } catch (error) {
        console.error(chalk.red('Erreur lors de la détermination du type de question:', error));
        return null;
    }
}






