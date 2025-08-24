import { openai } from "../configs/openai.js";
export async function responseCompleter(oldResponse) {
  if (!oldResponse?.includes("</Response>")) {
    const response = await openai.chat.completions.create({
      model: "@hf/thebloke/zephyr-7b-beta-awq",
      messages: [
        {
          role: "system",
          content:
            "You are a response completer, You will be handed with a full Think -> Action -> Response, and you need to continue from where it left off until </Response>",
        },
        {
          role: "user",
          content: `<Response>
                    # The Doppler Effect
                    The Doppler effect is a physical phenomenon that describes the change in frequency of a wave (such as sound or light) as the source of the wave moves relative to the observer. This effect is named after the Austrian physicist Christian Doppler, who first described it in 1842.
                    # How it works
                    The Doppler effect occurs because the frequency of a wave is determined by the distance between successive wave crests or troughs. If the source of the wave is moving towards the observer, the distance between successive wave crests or troughs appears shorter, resulting in a higher frequency (a higher-pitched sound or a bluer color of light). Conversely, if the source of the wave is moving away from the observer, the distance between successive wave crests or troughs appears longer, resulting in a lower frequency (a lower-pitched sound or a redder color of light).
                    # Applications
                    The Doppler effect has many practical applications, including:
                    - In medicine, the Doppler effect is used to monitor blood flow in the body by detecting the frequency shift of ultrasound waves as they bounce off moving blood cells.
                    - In astronomy, the Doppler effect is used to determine the motion of celestial objects by measuring the shift in the frequency of their light.
                    - In transportation, the Doppler effect is used to detect the speed of moving vehicles by measuring the shift in the frequency of their sound.
                    # Real-life examples
                    Here's an interesting fact: the Doppler effect is not just limited to sound and light. It also applies to other types of waves, such`,
        },
        {
          role: "assistant",
          content: ` as water waves and seismic waves. So, the next time you hear a siren or see a star, remember that the Doppler effect is at play!
    # Additional
    Look I found this interesting information from web <Action arguments=["big bang theory"]>search</Action>
    </Response>`,
        },
        {
          role: "user",
          content: `
    <Response>
    # Photosynthesis
    Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy stored in glucose. This process is essential for life on Earth because it produces oxygen as a byproduct.
    # How it works
    Photosynthesis takes place in chloroplasts, using a green pigment called chlorophyll. The process involves absorbing carbon dioxide (CO₂) from the air and water (H₂O) from the soil, then using sunlight to convert these molecules into glucose (C₆H₁₂O₆) and oxygen (O₂).
    # Importance
    Photosynthesis is vital because:
    - It is the primary source of oxygen in the atmosphere.
    - It provides the base of the food chain for almost all living things.
    - It helps regulate atmospheric CO₂ levels.
    # Fun Fact
    Did you know that some deep-sea bacteria can perform photosynthesis using geothermal light instead of sunlight?`,
        },
        {
          role: "assistant",
          content: `Pretty wild, right? Nature always finds a way.
    # Additional
    Look I found this interesting information from web <Action arguments=["photosynthesis process"]>search</Action>
    </Response>`,
        },

        {
          role: "user",
          content: `
    <Response>
    # Black Holes
    A black hole is a region in space where the gravitational pull is so strong that nothing, not even light, can escape from it.
    # How They Form
    Black holes usually form when massive stars collapse at the end of their life cycles. The core contracts under gravity, leading to the formation of a singularity with infinite density.
    # Effects
    - They distort space and time around them (gravitational lensing).
    - They can emit high-energy radiation when matter falls into them.
    - They are thought to be at the centers of most galaxies.
    # Cool Fact
    If you fell into a black hole, you'd experience 'spaghettification' — being stretched out like spaghetti due to extreme tidal forces.`,
        },
        {
          role: "assistant",
          content: `But don't worry — you wouldn't survive long enough to complain 😅
    # Additional
    Look I found this interesting information from web <Action arguments=["black holes nasa"]>search</Action>
    </Response>`,
        },

        {
          role: "user",
          content: `
    <Response>
    # Artificial Intelligence (AI)
    AI refers to the simulation of human intelligence in machines programmed to think and learn.
    # Types
    - Narrow AI: Performs specific tasks (like Siri, Alexa).
    - General AI: Hypothetical machines with human-level intelligence.
    - Superintelligent AI: A future concept of AI surpassing human intelligence.
    # Applications
    AI is used in:
    - Healthcare (diagnosis, drug discovery)
    - Transportation (self-driving cars)
    - Finance (fraud detection, trading)
    - Entertainment (recommendation systems)
    # Fun Bit
    Don't worry, AI isn't planning world domination… yet 😉`,
        },
        {
          role: "assistant",
          content: `But if your toaster starts asking for Wi-Fi, you might want to run! 😂
    # Additional
    Look I found this interesting information from web <Action arguments=["AI applications 2025"]>search</Action>
    </Response>`,
        },

        {
          role: "user",
          content: oldResponse,
        },
      ],
      
      //   stop: ["</Thought>", "</Response>"],
    });
    return oldResponse + response?.choices[0]?.message?.content;
  } else {
    return oldResponse;
  }
}
