import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export class AIHandler {
  async chat(message: string) {
    try {
      const response = await hf.textGeneration({
        model: 'google/flan-t5-xxl',
        inputs: `You are a travel assistant. Help with this request: ${message}`,
        parameters: {
          max_length: 200,
          temperature: 0.7,
        }
      });

      // Extract location from message using name entity recognition
      const nerResponse = await hf.tokenClassification({
        model: 'dbmdz/bert-large-cased-finetuned-conll03-english',
        inputs: message
      });

      // Find location entities
      const locations = nerResponse.filter(item => item.entity_group === 'LOC')
        .map(item => item.word);
      
      const location = locations.length > 0 ? locations[0] : null;

      return {
        message: {
          role: 'assistant',
          content: response.generated_text,
          timestamp: Date.now()
        },
        location
      };
    } catch (error: any) {
      throw new Error("Failed to process message: " + error.message);
    }
  }
}
