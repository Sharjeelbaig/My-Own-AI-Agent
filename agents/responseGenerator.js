import { openai } from "../configs/openai.js";
import { responses } from "../messages/responseMessages.js";

export async function generateResponse(thought) {
    const response = await openai.chat.completions.create({
    model:'@hf/thebloke/zephyr-7b-beta-awq',
    messages: [...responses, 
        {
            role: "user",
            content: thought
        },
],
  max_tokens: 480,
  max_completion_tokens: 1000,
  temperature: 0.7,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
//   stop: ["</Thought>", "</Response>"],
});
return response?.choices[0]?.message?.content;
}
