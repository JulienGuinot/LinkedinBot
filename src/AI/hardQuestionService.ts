import {queryOllama} from './ollama';
import {Resume} from '../types/resume';


export class HardQuestionService {
    constructor() {
        // Initialization code if needed
    }


    public async answerQuestion(question: string, resume : Resume): Promise<string> {    
        // Construction of the personnalized prompt for ollama
        let prompt = `Considering the resume of this person ${resume}, answer this question as if it was you. Question: ${question}`;
        let response = await queryOllama(prompt, resume);
        return response;
    }

}