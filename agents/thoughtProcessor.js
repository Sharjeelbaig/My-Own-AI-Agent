import { openai } from "../configs/openai.js";
import { thoughts } from "../messages/thoughtMessages.js";

export async function processThought(query) {
    const response = await openai.chat.completions.create({
        messages: [
            ...thoughts,
            {
                role: "user",
                content: query
            }
        ],
        model: '@cf/qwen/qwen1.5-14b-chat-awq',
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    });
    return response?.choices[0]?.message?.content;
}