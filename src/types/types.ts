// Définir les types pour la réponse de l'API
export interface DeepSeekResponse {
    success: boolean;
    data?: any;
    error?: string;
}

//definir les types pour les données de l'offre
export interface JobData {
    jobID: string;
    jobURL: string;
    jobTitle: string;
    company: string;
    location: string;
    experienceLevel: string;
    skills: string;
    contractType: string;
    description: string;
    applicants: string;
    benefits: string;
}

export interface EmptyField {
    element: any;
    label: string;
}

export interface FormError {
    message: string;
    type: 'REQUIRED' | 'INVALID_FORMAT' | 'RANGE_ERROR' | 'CUSTOM';
    field?: string;
}

export const FormErrorMessages = {
    REQUIRED: 'Effectuez une sélection',
    RANGE_ERROR: 'Veuillez entrer un nombre entre 0 et 99',
    INVALID_FORMAT: 'Format invalide',
    // Ajoutez d'autres messages selon vos besoins
} as const;
