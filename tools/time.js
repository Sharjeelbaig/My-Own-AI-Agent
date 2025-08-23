export async function getTime() {
    const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    return JSON.stringify({ currentTime })
}
