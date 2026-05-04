export async function generateAssistantResponse(
  userMessage: string, 
  context: string
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey === '') {
    const errorMsg = "⚠️ OPENROUTER_API_KEY is missing in environment variables.";
    console.error(errorMsg);
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

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "NextJS App"
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", response.status, errorText);
      throw new Error(`OpenRouter API Error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    if (!content) {
      throw new Error("Empty response from AI");
    }

    return content;
  } catch (error: any) {
    console.error('AI Service Error details:', {
      message: error.message,
      stack: error.stack
    });
    return "⚠️ AI temporarily unavailable. Please try again.";
  }
}
