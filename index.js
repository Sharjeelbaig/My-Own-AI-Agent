import { OpenAI } from "openai/client.js";
import { getCurrentTime } from "./tools/time.js";
import { getDate } from "./tools/date.js";
import { messages } from "./messages/messages.js";
import { parseResponse } from "./utils/responseParser.js";
import { search } from "./tools/search.js";
import { responseCompleter } from "./utils/responseCompleter.js";
import dotenv from "dotenv";

dotenv.config();


const openai = new OpenAI({
    apiKey: null,
    baseURL: process.env.BASE_URL
});

const response = await openai.chat.completions.create({
    model:'@hf/thebloke/zephyr-7b-beta-awq',
    messages: [...messages, 
        {
            role: "user",
            content: "What is doppler effect?"
        },
],
  max_tokens: 480,
  max_completion_tokens: 1000,
  temperature: 0.7,
  top_p: 1,
  frequency_penalty: 0,
  presence_penalty: 0,
  stop: ["</Thought>", "</Response>"],
});

const unParsedResponse = response?.choices[0]?.message?.content || '';

const parsedResponse = await parseResponse(unParsedResponse);

const finalResponse = await responseCompleter(parsedResponse);

const parsedFinalResponse = await parseResponse(finalResponse);

console.log(parsedFinalResponse);
