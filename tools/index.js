import { generic } from "./generic.js";
import { getLocation } from "./location.js";
import { getTime } from "./time.js";
import { getCurrentWeather } from "./weather.js";
import { search } from "./search.js";
import { codeGenerator } from "./codeGenerator.js";
import { automationTool } from "./automationTool.js";

export const tools = {
    getCurrentWeather,
    getLocation,
    getTime,
    generic,
    search,
    codeGenerator,
    automationTool
}