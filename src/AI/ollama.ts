import { Resume } from "../types/resume";

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";
const MODEL_NAME = process.env.AI_MODEL_NAME;




// Configure a main prompt sent with each request


export async function queryOllama(message: string, resume: Resume): Promise<string> {
    const prompt = await createPrompt(message, resume);
    try {
        const response = await fetch(OLLAMA_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                prompt: prompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        //const answer = data.response.split(".")[0]
        return await cleanAnswer(data.response);
    } catch (error) {
        console.error("Erreur lors de la communication avec Ollama:", error);
        return "Une erreur est survenue.";
    }
}





async function createPrompt(message: string, resume: Resume): Promise<string> {
    return `
    You are an automated system designed to apply to jobs for people, you need to get in their shoes, resume info will be provided to you.
    You will receive question as if you were the user, and you have to answer briefly. if the question inclues "Have you" 
    or soemthing like this answer shoud be yer or no only.
    just the response to the question nothing else, never talk to much or give unneccessary details: example : 
    Question: why do you want to apply to this job?
    Response: I want to apply to this job because I am a good fit for it.
    Question: how many years of experience do you have with management?
    Response: 5
    Question: Do you have experience with Excel?
    Response: No
    Hope this is clear. DO NOT Invent anything as it could ruin the application, and remember, YOU ARE THE USER.


    Here the resume: ${JSON.stringify(resume)}
    and here the question: ${message}


    Answer the question based on the resume.
    `;
}


export async function cleanAnswer(answer: string): Promise<string> {
    // Nettoyer la réponse pour extraire uniquement "Yes" ou "No"
    const cleanedAnswer = answer.trim().toLowerCase();
    
    // Si la réponse contient "yes", retourner "Yes"
    if (cleanedAnswer.includes('yes')) {
        return 'Yes';
    }
    // Si la réponse contient "no", retourner "No"
    if (cleanedAnswer.includes('no')) {
        return 'No';
    }
    
    // Si la réponse ne contient ni "yes" ni "no", retourner la réponse originale
    return answer;
}


//example usage
const resume = require("../../resume.json");
const response = await queryOllama("Avez vous deja travaillé avec la suite microsoft office ?", resume);
console.log(response);


//if bugs or not working properly 

/*
async function checkOllama(): Promise<boolean> {

    try {
        const response = await fetch("http://127.0.0.1:11434/api/tags");
        console.log("Ollama est en cours d'exécution");
        return response.ok;
    } catch {
        console.error("Ollama n'est pas en cours d'exécution");
        return false;
    }
}

checkOllama();
*/