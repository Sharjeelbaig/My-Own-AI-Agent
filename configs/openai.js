import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

export const openai = new OpenAI({
    apiKey: null,
    baseURL: process.env.BASE_URL,
    fetch: async (...args)  => {
    const response = await fetch(...args)
    return response
}
});
