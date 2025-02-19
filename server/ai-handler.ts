import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export class AIHandler {
  async chat(message: string) {
    try {
      const response = await hf.textGeneration({
        model: 'google/flan-t5-xxl',
        inputs: `You are a helpful travel assistant. Help with this request: ${message}
        If the user mentions a location, extract it and provide relevant travel information.
        Be concise but informative.`,
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
          content: response.generated_text.trim(),
          timestamp: Date.now()
        },
        location
      };
    } catch (error) {
      console.error('AI Handler error:', error);
      throw new Error(`Failed to process message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}