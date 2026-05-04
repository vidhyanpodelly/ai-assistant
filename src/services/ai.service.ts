import { OpenRouter } from "@openrouter/sdk";

const openrouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || ''
});

export async function generateAssistantStreamingResponse(
  userMessage: string, 
  context: string, 
  onChunk: (chunk: string) => void
) {
  if (!process.env.OPENROUTER_API_KEY) {
    console.error('OPENROUTER_API_KEY is missing');
    onChunk("The assistant service is currently unavailable. Please check configuration.");
    return "Service unavailable";
  }

  try {
    const prompt = `
      You are an assistant for a multi-tenant platform.
      
      CONTEXT:
      ${context || 'No specific integration context.'}

      USER MESSAGE:
      ${userMessage}

      INSTRUCTIONS:
      - Use context to answer if available.
      - Keep it professional.
      - Be concise.
    `;

    const stream = await openrouter.chat.send({
      chatRequest: {
        model: "openai/gpt-oss-120b:free",
        messages: [{ role: "user", content: prompt }],
        stream: true,
      }
    });

    let fullMessage = "";
    // The SDK returns an async iterable for streaming
    for await (const chunk of stream as any) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        fullMessage += content;
        onChunk(content);
      }
    }

    return fullMessage;
  } catch (error: any) {
    console.error('AI Service Error details:', {
      message: error.message,
      stack: error.stack,
      status: error.status,
      data: error.data
    });
    onChunk(`\n\n⚠️ AI temporarily unavailable. Please try again.`);
    return "Error occurred";
  }
}
