import config from './config.js';

const initialMessage = {
    en: "I'm currently unavailable. Would you like to talk to my AI assistant?\n\n1. Yes\n2. No\n\nReply with the number that suits you.",
    fr: "Je ne suis pas disponible pour le moment. Souhaitez-vous parler à mon intelligence artificielle ?\n\n1. Oui\n2. Non\n\nRépondez avec le chiffre qui vous convient.",
    ht: "Mwen pa disponib kounye a. Èske ou ta renmen pale ak asistan AI mwen an?\n\n1. Wi\n2. Non\n\nReponn ak chif ki apwopriye ou."
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

        return { text: "I don't understand your request. Could you please rephrase?" };
    } catch (error) {
        console.error("Error generating response:", error);
        return { text: "Sorry, I encountered an error. Please try again later." };
    }
}

export { generateResponse };
