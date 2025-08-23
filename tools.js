export async function getCurrentWeather() {
    const weather = {
        temperature: "72",
        unit: "F",
        forecast: "sunny"
    }
    return JSON.stringify(weather)
}

export async function getLocation() {
    return "New York City, NY"
}

export async function getTime() {
    const currentTime = Date.now()
    return JSON.stringify({ currentTime })
}
