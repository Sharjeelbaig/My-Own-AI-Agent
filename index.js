import OpenAI from "openai"
import { getCurrentWeather, getLocation, getTime } from "./tools.js"
import dotenv from "dotenv"
import fs from "fs/promises"

dotenv.config()

export const openai = new OpenAI({
  apiKey: null,
  baseURL: process.env.baseURL,
})

const availableFunctions = {
    getCurrentWeather,
    getLocation,
    getTime
}


 const systemPrompt = await fs.readFile('./prompt.txt', 'utf-8')

async function parseActionString(text) {
    const lines = text.split("\n")
    const actionRegex = /^Action: (\w+): (.*)$/
    const foundActionStr = lines?.find(str => actionRegex?.test(str))
    const actions = actionRegex["exec"](foundActionStr)
    const [_, action, actionArg] = actions
    const observation = await availableFunctions[action](actionArg)
    return observation
}

async function agent(query) {
    const messages = [
        {
            role: 'system',
            content: systemPrompt
        },
        {
            role: 'user',
            content: query
        }
    ]
    const response = await openai.chat.completions.create({
        messages
    })

    const text = response.choices[0].message.content
    const observation = await parseActionString(text)
    console.log(observation)
}

agent("What time is it?")