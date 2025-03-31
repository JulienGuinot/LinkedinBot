import { Page } from "puppeteer";
import chalk from 'chalk';


//function to answer the select question
export async function answerSelectQuestion(page: Page, labelText: string) {
    try {
        console.log(chalk.blue(`🔍 Recherche du select pour la question : "${labelText}"`));
        
        // Méthode améliorée pour trouver le select associé au label
        const selectElement = await page.evaluate((labelText) => {
            // Version normalisée du texte de recherche (minuscules, sans accents, espaces réduits)
            const normalizeText = (text) => {
                return text.toLowerCase()
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // Supprime les accents
                    .replace(/\s+/g, ' ').trim();  // Normalise les espaces
            };
            
            const normalizedSearchText = normalizeText(labelText);
            
            // Recherche tous les labels
            const labels = Array.from(document.querySelectorAll('label'));
            
            // Trouve le label qui contient le texte normalisé
            const matchingLabel = labels.find(label => {
                const fullText = label.textContent || '';
                const normalizedLabelText = normalizeText(fullText);
                return normalizedLabelText.includes(normalizedSearchText);
            });
            
            if (!matchingLabel) return null;
            
            // Récupérer l'ID du select associé
            const forAttribute = matchingLabel.getAttribute('for');
            if (!forAttribute) return null;
            
            // Vérifier si le select existe
            const select = document.querySelector(`select#${forAttribute}`);
            return select ? forAttribute : null;
        }, labelText);

        if (selectElement) {
            // Sélectionner l'élément select
            const select = await page.$(`select#${selectElement}`);
            if (select) {
                // Obtenir toutes les options disponibles
                const options = await page.evaluate((selectId) => {
                    const select = document.getElementById(selectId) as HTMLSelectElement;
                    if (!select) return [];
                    
                    // Récupérer toutes les options sauf la première (qui est généralement "Sélectionner une option")
                    return Array.from(select.options)
                        .slice(1) // Ignorer l'option par défaut
                        .map((opt: HTMLOptionElement) => ({
                            value: opt.value,
                            text: opt.textContent?.trim()
                        }))
                        .filter(opt => 
                            // Filtrer les valeurs vides ou les options par défaut potentielles
                            opt.value && 
                            !['select an option', 'sélectionner une option', 'choisir une option'].includes(opt.value.toLowerCase())
                        );
                }, selectElement);

                if (options.length > 0) {
                    // Toujours choisir "Yes" si disponible, sinon prendre la première option
                    const yesOption = options.find(opt => opt.value.toLowerCase() === 'yes');
                    const selectedOption = yesOption || options[0];
                    
                    // Sélectionner l'option
                    await page.select(`select#${selectElement}`, selectedOption.value);
                    console.log(chalk.green(`✅ Option sélectionnée : "${selectedOption.value}" (${selectedOption.text})`));
                    
                    // Vérification que l'option a bien été sélectionnée
                    const selectedValue = await page.$eval(`select#${selectElement}`, (el: HTMLSelectElement) => el.value);
                    if (selectedValue === selectedOption.value) {
                        console.log(chalk.green(`✅ Confirmation: option "${selectedOption.value}" correctement sélectionnée`));
                    } else {
                        console.log(chalk.red(`❌ Échec de sélection: valeur actuelle "${selectedValue}" au lieu de "${selectedOption.value}"`));
                    }
                } else {
                    console.log(chalk.yellow('⚠️ Aucune option valide trouvée dans le select'));
                }
            }
        } else {
            console.log(chalk.red(`❌ Select non trouvé pour : "${labelText}"`));
        }
    } catch (error) {
        console.error(chalk.red('❌ Erreur lors de la sélection dans le menu déroulant:', error));
    }
}
