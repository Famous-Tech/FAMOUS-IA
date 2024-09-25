import config from './config.js';
import OpenAI from "openai";
import dotenv from 'dotenv';
dotenv.config();

const initialMessage = {
    en: "I'm currently unavailable. Would you like to talk to my AI assistant?\n\n1. Yes\n2. No\n\nReply with the number that suits you.",
    fr: "Je ne suis pas disponible pour le moment. Souhaitez-vous parler à mon intelligence artificielle ?\n\n1. Oui\n2. Non\n\nRépondez avec le chiffre qui vous convient.",
    ht: "Mwen pa disponib kounye a. Èske ou ta renmen pale ak entelijans atifisyel  mwen an?\n\n1. Wi\n2. Non\n\nReponn ak chif ki apwopriye ou."
};

const countryToLanguage = {
    '1': 'en', // USA
    '33': 'fr', // France
    '509': 'ht', // Haiti
    '228': 'fr', // Togo
    '242': 'fr', // Congo
    '221': 'fr', // Senegal
    '237': 'fr', // Cameroon
    '229': 'fr', // Benin
    '225': 'fr', // Ivory Coast
    '233': 'en', // Ghana
    '234': 'en', // Nigeria
    '254': 'en', // Kenya
    '256': 'en', // Uganda
    '260': 'en', // Zambia
    '263': 'en', // Zimbabwe
    '265': 'en', // Malawi
    '266': 'en', // Lesotho
    '267': 'en', // Botswana
    '268': 'en', // Eswatini
    '269': 'fr', // Comoros
};

function detectLanguage(phoneNumber) {
    try {
        const countryCode = String(phoneNumber).substring(0, 3);
        return countryToLanguage[countryCode] || 'en'; // Default to English if country code not found
    } catch (error) {
        console.error("Error detecting language:", error);
        return 'en'; // Default to English in case of error
    }
}

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY
});

async function generateResponse(text, phoneNumber, isFirstInteraction) {
    try {
        const lang = detectLanguage(phoneNumber);
        
        if (isFirstInteraction) {
            return {
                text: initialMessage[lang]
            };
        }

        const lowerText = text.toLowerCase();

        if (lowerText === "1" || lowerText === "oui" || lowerText === "wi") {
            return {
                text: `Here are some suggestions:\n\n1. ${config[lang].is.services[0]}\n2. ${config[lang].is.recruitment[0]}\n3. ${config[lang].is.blog[0]}\n4. ${config[lang].is.hosting[0]}\n5. ${config[lang].is.contact[0]}\n\nReply with the number that suits you.`
            };
        }

        if (lowerText === "2" || lowerText === "non") {
            return {
                text: "Thank you for your interest. If you change your mind, feel free to reach out again."
            };
        }

        for (const key in config[lang].is) {
            if (config[lang].is[key].some(phrase => lowerText.includes(phrase))) {
                if (key === 'greeting') {
                    const currentHour = new Date().getHours();
                    let greeting;
                    if (currentHour >= 5 && currentHour < 12) {
                        greeting = config[lang].responses.greeting.morning;
                    } else if (currentHour >= 12 && currentHour < 18) {
                        greeting = config[lang].responses.greeting.afternoon;
                    } else {
                        greeting = config[lang].responses.greeting.evening;
                    }
                    return { text: greeting };
                }
                return { text: config[lang].responses[key] };
            }
        }

        // Appeler l'API DeepSeek pour générer une réponse
        const deepSeekResponse = await callDeepSeekAPI(text, lang);
        return { text: deepSeekResponse };
    } catch (error) {
        console.error("Error generating response:", error);
        return { text: "Sorry, I encountered an error. Please try again later." };
    }
}

async function callDeepSeekAPI(text, lang) {
    try {
        const prompt = `You are an AI assistant called FAMOUS-AI for the FAMOUS-TECH-GROUP an HAITIAN company offering various services. The user is asking about your services, pricing, or how to contact you. Here are the details of your services and pricing:\n\n1. Web Development: Starting at 1000 Gourdes\n2. Portfolio Creation: Starting at 500 Gourdes\n3. Blog Development: Starting at 1300 Gourdes\n4. Top-Up Website: Starting at 1500 Gourdes\n5. E-commerce Website: Starting at 2500$\n\nYou can be contacted via email at famoustechht@gmail.com or by phone at +509 43782508.\n\nThe user's message is: ${text}\n\nPlease generate a response in ${lang} language.`;
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "deepseek-chat",
        });

        return completion.choices[0].message.content.trim();
    } catch (error) {
        console.error("Error calling DeepSeek API:", error);
        return "Sorry, I encountered an error. Please try again later.";
    }
}

export { generateResponse, callDeepSeekAPI };
