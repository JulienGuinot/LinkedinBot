import chalk from 'chalk';
import { sendDiscordWebhookMessage } from '../other/utils';
import { LinkedInBotError } from './customError';





export class ErrorHandler {
    private static instance: ErrorHandler;
    private errorCount: Map<string, number> = new Map();

    private readonly MAX_RETRIES = 3;

    private constructor() {}

    public static getInstance(): ErrorHandler {
        if (!ErrorHandler.instance) {
            ErrorHandler.instance = new ErrorHandler();
        }
        return ErrorHandler.instance;
    }

    public async handleError(error: Error | LinkedInBotError, context?: string): Promise<void> {
        const errorCode = error instanceof LinkedInBotError ? error.code : 'UNKNOWN_ERROR';
        
        // Incrémenter le compteur d'erreurs
        const currentCount = (this.errorCount.get(errorCode) || 0) + 1;
        this.errorCount.set(errorCode, currentCount);

        // Log l'erreur
        console.error(chalk.red(`❌ Erreur [${errorCode}] : ${error.message}`));
        if (context) {
            console.error(chalk.yellow(`📍 Contexte : ${context}`));
        }

        // Envoyer à Discord si c'est une erreur critique ou répétée
        if (currentCount >= this.MAX_RETRIES) {
            await this.notifyDiscord(error, context);
        }

        // Gérer les erreurs spécifiques
        if (error instanceof LinkedInBotError) {
            await this.handleSpecificError(error);
        }
    }

    private async notifyDiscord(error: Error, context?: string): Promise<void> {
        const message = `❌ Erreur critique : ${error.message}\n📍 Contexte : ${context || 'Non spécifié'}`;
        await sendDiscordWebhookMessage(message);
    }

    private async handleSpecificError(error: LinkedInBotError): Promise<void> {
        switch (error.code) {
            case 'ERR_NAVIGATION':
                // Logique spécifique pour les erreurs de navigation
                console.log(chalk.yellow('🔄 Tentative de rechargement de la page...'));
                break;
            case 'ERR_FORM':
                // Logique spécifique pour les erreurs de formulaire
                console.log(chalk.yellow('⚠️ Erreur de formulaire détectée'));
                break;
            // Ajouter d'autres cas selon les besoins
        }
    }

    public resetErrorCount(errorCode: string): void {
        this.errorCount.delete(errorCode);
    }
}