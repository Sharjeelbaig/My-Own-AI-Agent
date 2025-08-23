import OpenAI from "openai"
import { tools } from "./tools/index.js"
import dotenv from "dotenv"
import fs from "fs/promises"

dotenv.config()

export const openai = new OpenAI({
  apiKey: null,
  baseURL: "https://sde.eng-sharjeel-baig.workers.dev/v1",
})

const availableFunctions = {
    getCurrentWeather: tools.getCurrentWeather,
    getLocation: tools.getLocation,
    getTime: tools.getTime,
    generic: tools.generic,
    search: tools.search,
    codeGenerator: tools.codeGenerator,
    automationTool: tools.automationTool
}

const systemPrompt = await fs.readFile('./prompts/system.txt', 'utf-8')

async function parseActionString(text) {
    try {
        const lines = text.split("\n")
        const actionRegex = /^Action: (\w+): (.*)$/
        const foundActionStr = lines?.find(str => actionRegex?.test(str))
        
        if (!foundActionStr) {
            // If no action found, treat as generic response
            return text
        }
        
        const actions = actionRegex.exec(foundActionStr)
        if (!actions) {
            return text
        }
        
        const [_, action, actionArg] = actions
        
        if (!availableFunctions[action]) {
            return `Error: Unknown action "${action}"`
        }
        
        // Handle null arguments properly
        const argument = actionArg === 'null' ? null : actionArg
        const observation = await availableFunctions[action](argument)
        return observation
    } catch (error) {
        console.error('Error parsing action:', error)
        return `Error: ${error.message}`
    }
}

async function agent(query) {
    try {
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
        
        let maxIterations = 5
        let currentIteration = 0
        
        while (currentIteration < maxIterations) {
            const response = await openai.chat.completions.create({
                messages,
                temperature: 0.7
            })

            const text = response.choices[0].message.content
            console.log(`\n--- Iteration ${currentIteration + 1} ---`)
            console.log(text)
            
            // Check if this is a final answer
            if (text.includes('Answer:')) {
                const answerMatch = text.match(/Answer:\s*(.*)/s)
                if (answerMatch) {
                    console.log('\n🎯 Final Answer:')
                    console.log(answerMatch[1].trim())
                    return
                }
            }
            
            // Check if we need to pause for observation
            if (text.includes('PAUSE')) {
                const observation = await parseActionString(text)
                console.log('\n📊 Observation:')
                console.log(observation)
                
                // Add the assistant's response and observation to messages
                messages.push({
                    role: 'assistant',
                    content: text
                })
                messages.push({
                    role: 'user',
                    content: `Observation: ${observation}`
                })
            } else {
                // If no PAUSE, this might be a direct response
                console.log('\n💬 Direct Response:')
                console.log(text)
                return
            }
            
            currentIteration++
        }
        
        console.log('\n⚠️ Maximum iterations reached')
        
    } catch (error) {
        console.error('Agent error:', error.message)
        
        // Fallback for simple queries
        if (query.toLowerCase().includes('hello') || query.toLowerCase().includes('hi')) {
            console.log('\n👋 Hello! How can I help you today?')
        } else {
            console.log('\n❌ I apologize, but I encountered an error processing your request.')
        }
    }
}

const arg = process.argv[2] 

if (!arg) {
    console.log('Usage: node index.js "your question here"')
    console.log('Examples:')
    console.log('  node index.js "what time is it?"')
    console.log('  node index.js "hello"')
    console.log('  node index.js "create a react project about todo app"')
    console.log('  node index.js "what is the weather?"')
    process.exit(1)
}

agent(arg)