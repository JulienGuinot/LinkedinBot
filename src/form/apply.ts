import { randomTimeout} from '../other/utils';
import { answerTextQuestion } from './HandleQuestions/textQuestions';
import { answerRadioButtonQuestion } from './HandleQuestions/radioQuestions';
import { answerCheckboxQuestion } from './HandleQuestions/checkboxQuestions';
import { answerSelectQuestion } from './HandleQuestions/selectQuestions';
import chalk from 'chalk';
import { ErrorHandler } from '../errors/errorHandler';
import { LinkedInBotError, ErrorCodes } from '../errors/customError';
import {unsubscribeCompany} from './unsubscribeCompany'
import { handleFormErrors } from '../errors/handleFormErrors';
import { determineQuestionType } from './determineQuestion';
import { checkRequiredFields } from './checkRequiredFields';
import { EmptyField } from '../types/types';
import { Page } from 'puppeteer';



// Fonction pour remplir les champs requis vides
async function fillRequiredFields(page, emptyFields: EmptyField[]) {
    console.log(chalk.blue('🔄 Début du remplissage des champs requis...'));

    for (const field of emptyFields) {
        try {
            const labelText = field.label.toLowerCase();
            const questionType = await determineQuestionType(page, labelText);

            console.log(chalk.yellow(`📝 Traitement du champ "${labelText}" (type: ${questionType})`));

            let retryCount = 0;
            const maxRetries = 3;

            while (retryCount < maxRetries) {
                try {
                    switch (questionType) {
                        case 'text':
                            await answerTextQuestion(page, labelText);
                            break;
                        case 'radio':
                            await answerRadioButtonQuestion(page, labelText);
                            break;
                        case 'checkbox':
                            await answerCheckboxQuestion(page, labelText);
                            break;
                        case 'select':
                            await answerSelectQuestion(page, labelText);
                            break;
                        default:
                            console.log(chalk.yellow(`⚠️ Type de question non reconnu pour "${labelText}"`));
                            continue;
                    }

                    // Vérifier les erreurs après chaque remplissage
                    await handleFormErrors(page);
                    break; // Sortir de la boucle si pas d'erreur

                } catch (error) {
                    if (error instanceof LinkedInBotError && error.code === ErrorCodes.FORM_VALIDATION) {
                        retryCount++;
                        console.log(chalk.yellow(`⚠️ Tentative ${retryCount}/${maxRetries} - Erreur: ${error.message}`));
                        
                        const formError = error.context?.formError;
                        if (formError?.type === 'RANGE_ERROR') {
                            await field.element.evaluate(el => el.value = '5');
                        } else if (formError?.type === 'REQUIRED' && questionType === 'select') {
                            // Essayer une autre option
                            await answerSelectQuestion(page, labelText); // true pour forcer une autre option
                        }
                        
                        if (retryCount === maxRetries) {
                            throw error; // Relancer l'erreur si max retries atteint
                        }
                        
                        await randomTimeout(1000, 2000);
                        continue;
                    }
                    throw error; // Relancer les autres types d'erreurs
                }
            }

            await randomTimeout(1000, 2000);

        } catch (error) {
            console.error(chalk.red(`❌ Erreur lors du remplissage du champ "${field.label}":`, error));
            throw error;
        }
    }
}

// Function to handle the application form
export async function handleApplicationForm(page) {
    const errorHandler = ErrorHandler.getInstance();
    
    console.log(chalk.blue('🔄 Début du traitement du formulaire de candidature...'));
    try {
        while (true) {
            console.log(chalk.yellow('⏳ Attente du chargement complet de la page...'));
            await randomTimeout(300, 1000);

            // Vérifier et remplir les champs requis
            console.log(chalk.blue('🔍 Recherche des champs requis...'));
            const emptyFields = await checkRequiredFields(page);
            
            if (emptyFields.length > 0) {
                console.log(chalk.yellow(`📝 ${emptyFields.length} champs requis trouvés à remplir :`));
                emptyFields.forEach((field, index) => {
                    console.log(chalk.cyan(`   ${index + 1}. Label: "${field.label}"`));
                });
                
                console.log(chalk.blue('✍️ Début du remplissage des champs...'));
                await fillRequiredFields(page, emptyFields);
                console.log(chalk.green('✅ Champs remplis'));
                
                await randomTimeout(800, 1000);
                console.log(chalk.blue('🔄 Vérification des champs restants...'));
                continue;
            }

            console.log(chalk.blue('🔍 Recherche des boutons d\'action...'));
            const submitButton = await page.$('button[aria-label="Envoyer la candidature"]');
            const reviewButton = await page.$('button[aria-label="Vérifiez votre candidature"]');
            const nextButton = await page.$("button[aria-label='Passez à l’étape suivante']");


            if (submitButton) {
                console.log(chalk.green('🎯 Bouton de soumission trouvé - Envoi de la candidature...'));
                await unsubscribeCompany(page)
                await submitButton.click();
                console.log(chalk.green('✨ Candidature soumise avec succès !'));
                return;
            }

            if (reviewButton) {
                console.log(chalk.yellow('👀 Bouton de vérification trouvé - Passage à la revue...'));
                await reviewButton.click();
                await randomTimeout(800, 1000);
                continue;
            }

            if (nextButton) {
                console.log(chalk.yellow('➡️ Bouton suivant trouvé - Passage à l\'étape suivante...'));
                await nextButton.click();
                await randomTimeout(800, 1000);
                continue;
            }

            console.log(chalk.red('❌ Aucun bouton d\'action trouvé et tous les champs sont remplis'));
            break;
        }
    } catch (error) {
        if (error instanceof LinkedInBotError) {
            await errorHandler.handleError(error, 'Traitement du formulaire de candidature');
        } else {
            await errorHandler.handleError(
                new LinkedInBotError(
                    error.message,
                    ErrorCodes.FORM,
                    { url: await page.url() }
                ),
                'Traitement du formulaire de candidature'
            );
        }
        throw error;
    }
}



