import { ErrorCodes } from "./customError";
import { LinkedInBotError } from "./customError";
import { FormError, FormErrorMessages } from "../types/types";
import chalk from "chalk";


//function check if the page contains a form filling error message and return it
export async function detectFormErrors(page): Promise<FormError | null> {
    const error = await page.evaluate(() => {
        const errorElements = document.querySelectorAll('[data-test-form-element-error-messages] .artdeco-inline-feedback__message');
        const errors: Array<{message: string, field?: string}> = [];
        
        errorElements.forEach(element => {
            const errorMessage = element.textContent?.trim() || '';
            const formElement = element.closest('[data-test-form-element]');
            const field = formElement?.querySelector('label')?.textContent?.trim();
            
            errors.push({
                message: errorMessage,
                field: field
            });
        });
        
        return errors.length > 0 ? errors[0] : null;
    });

    if (!error) return null;

    // Déterminer le type d'erreur
    let errorType: FormError['type'] = 'CUSTOM';
    if (error.message === FormErrorMessages.REQUIRED) {
        errorType = 'REQUIRED';
    } else if (error.message.includes('entre 0 et 99')) {
        errorType = 'RANGE_ERROR';
    }

    return {
        message: error.message,
        type: errorType,
        field: error.field
    };
}


//function to adress the error message 
export async function handleFormErrors(page) {
    const error = await detectFormErrors(page);
    if (error) {
        console.log(chalk.yellow(`⚠️ Erreur de formulaire détectée: ${error.message}`));
        
        switch (error.type) {
            case 'REQUIRED':
                throw new LinkedInBotError(
                    `Champ requis non rempli: ${error.field || 'champ inconnu'}`,
                    ErrorCodes.FORM_VALIDATION,
                    { formError: error }
                );
                
            case 'RANGE_ERROR':
                throw new LinkedInBotError(
                    `Erreur de plage: ${error.message}`,
                    ErrorCodes.FORM_VALIDATION,
                    { formError: error }
                );
                
            default:
                throw new LinkedInBotError(
                    `Erreur de formulaire LinkedIn: ${error.message}`,
                    ErrorCodes.FORM_VALIDATION,
                    { formError: error }
                );
        }
    }
}