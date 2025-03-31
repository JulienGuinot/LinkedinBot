import chalk from 'chalk';
import { EmptyField } from '../types/types';

// Fonction pour vérifier les champs requis
export async function checkRequiredFields(page): Promise<EmptyField[]> {
    console.log(chalk.blue('🔍 Début de la vérification des champs requis...'));
    
    // Modification pour inclure les champs avec aria-required="true"
    const requiredFields = await page.$$('input[required], textarea[required], select[required], input[aria-required="true"], textarea[aria-required="true"], select[aria-required="true"]');
    console.log(chalk.yellow(`📊 Nombre total de champs requis trouvés : ${requiredFields.length}`));
    
    // Recherche additionnelle pour les groupes de boutons radio requis
    const radioGroups = await page.$$('fieldset:has(input[type="radio"][aria-required="true"])');
    console.log(chalk.yellow(`📊 Nombre de groupes radio requis trouvés : ${radioGroups.length}`));
    
    const emptyFields: EmptyField[] = [];

    for (const field of requiredFields) {
        try {
            // Récupération combinée du tagName et elementType
            const { tagName, elementType } = await field.evaluate((el) => {
                const tag = el.tagName.toLowerCase();
                return {
                    tagName: tag,
                    elementType: el instanceof HTMLInputElement ? el.type : tag
                };
            });

            const id = await field.evaluate(el => el.id);
            const label = await field.evaluate(el => {
                const labelEl = document.querySelector(`label[for="${el.id}"]`);
                return labelEl?.textContent?.trim() || 'Label non trouvé';
            });

            console.log(chalk.cyan(`   Champ trouvé - Type: ${elementType}, ID: ${id}, Label: ${label}`));

            let isEmpty = false;
            if (elementType === 'radio') {
                isEmpty = await field.evaluate(el => {
                    const name = el.getAttribute('name');
                    return !document.querySelector(`input[type="radio"][name="${name}"]:checked`);
                });
            } else if (tagName === 'select') { // Utilisez tagName ici pour plus de fiabilité
                isEmpty = await field.evaluate(el => {
                    const value = (el as HTMLSelectElement).value;
                    // Vérifier plusieurs formats possibles d'options par défaut
                    return !value || value === 'Select an option' || value === 'Sélectionner une option' || value === el.querySelector('option:first-child')?.value;
                });
            } else {
                const value = await field.evaluate(el => el.value);
                isEmpty = !value;
            }
            
            if (isEmpty) {
                emptyFields.push({ element: field, label });
                console.log(chalk.yellow(`   ⚠️ Champ vide détecté : ${label}`));
            }
        } catch (error) {
            console.error(chalk.red(`❌ Erreur lors de l'analyse d'un champ :`, error));
        }
    }
    
    // Traitement spécifique pour les groupes radio
    for (const group of radioGroups) {
        try {
            const id = await group.evaluate(el => el.id);
            const label = await group.evaluate(el => {
                const legendEl = el.querySelector('legend');
                return legendEl?.textContent?.trim() || 'Label non trouvé';
            });
            
            console.log(chalk.cyan(`   Groupe radio trouvé - ID: ${id}, Label: ${label}`));
            
            // Vérifier si un bouton est sélectionné dans le groupe
            const isEmpty = await group.evaluate(el => {
                return !el.querySelector('input[type="radio"]:checked');
            });
            
            if (isEmpty) {
                emptyFields.push({ element: group, label });
                console.log(chalk.yellow(`   ⚠️ Groupe radio sans sélection : ${label}`));
            }
        } catch (error) {
            console.error(chalk.red(`❌ Erreur lors de l'analyse d'un groupe radio :`, error));
        }
    }

    console.log(chalk.green(`✅ Vérification terminée - ${emptyFields.length} champs vides trouvés`));
    return emptyFields;
}