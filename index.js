import { parseResponse } from "./utilities/responseParser.js";
import { responseCompleter } from "./agents/responseCompleter.js";
import { generateResponse } from "./agents/responseGenerator.js";
import { processThought } from "./agents/thoughtProcessor.js";
import { extractResponseContent } from "./utilities/resposeExtractor.js";


const thoughts = await processThought("search big bang");
const response = await generateResponse(thoughts);
const parsedResponse = await parseResponse(response);
const finalResponse = await responseCompleter(parsedResponse);
const parsedFinalResponse = await parseResponse(finalResponse);



const answer = extractResponseContent(parsedFinalResponse);
console.log(answer);