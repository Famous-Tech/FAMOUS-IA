const services = {
    en: [
        "Web Development",
        "Portfolio Creation",
        "Blog Development",
        "Top-Up Website",
        "E-commerce Website"
    ],
    fr: [
        "Développement Web",
        "Création de Portfolio",
        "Développement de Blog",
        "Site de Recharge",
        "Site de E-commerce"
    ],
    ht: [
        "Devlopman Entènèt",
        "Kreyasyon Portfolio",
        "Devlopman Blog",
        "Sit Rechaje",
        "Sit E-commerce"
    ]
};

const websiteLinks = {
    recruitment: "https://famous-tech-group-recrutements.vercel.app",
    services: "https://famous-tech-group.vercel.app",
    blog: "https://famous-tech-group-blog.vercel.app"
};

const initialMessage = {
    en: "I'm currently unavailable. Would you like to talk to my AI assistant?\n\n1. Yes\n2. No\n\nReply with the number that suits you.",
    fr: "Je ne suis pas disponible pour le moment. Souhaitez-vous parler à mon intelligence artificielle ?\n\n1. Oui\n2. Non\n\nRépondez avec le chiffre qui vous convient.",
    ht: "Mwen pa disponib kounye a. Èske ou ta renmen pale ak asistan AI mwen an?\n\n1. Wi\n2. Non\n\nReponn ak chif ki apwopriye ou."
};

const suggestions = {
    en: [
        "What services do you offer?",
        "What is the link to your recruitment website?",
        "What is the link to your services website?",
        "Can I see your blog?",
        "Do you offer web hosting?"
    ],
    fr: [
        "Quels services offrez-vous ?",
        "Quel est le lien de votre site Web de recrutement ?",
        "Quel est le lien de votre site de services ?",
        "Puis-je voir votre blog?",
        "Offrez-vous de l'hébergement web ?"
    ],
    ht: [
        "Ki sèvis ou ofri?",
        "Ki lyen sit wèb rekritman ou a?",
        "Ki lyen sit entènèt sèvis ou a?",
        "Èske mwen ka wè blog ou a?",
        "Èske ou ofri sèvis hosting?"
    ]
};

const faq = {
    en: [
        "We offer competitive pricing for all our services.",
        "Our customer support is available 24/7.",
        "Yes, we offer cloud hosting services.",
        "Our latest updates can be found on our blog.",
        "For custom services, feel free to contact us directly."
    ],
    fr: [
        "Nous proposons des prix compétitifs pour tous nos services.",
        "Notre service client est disponible 24/7.",
        "Oui, nous offrons des services d'hébergement cloud.",
        "Nos dernières mises à jour se trouvent sur notre blog.",
        "Pour des services personnalisés, n'hésitez pas à nous contacter directement."
    ],
    ht: [
        "Nou ofri pri konpetitif pou tout sèvis nou yo.",
        "Sèvis kliyan nou an disponib 24/7.",
        "Wi, nou ofri sèvis hosting nan nwaj.",
        "Nouvo mizajou nou yo sou blog nou an.",
        "Pou sèvis pèsonalize, pa ezite kontakte nou dirèkteman."
    ]
};

const greetings = {
    en: {
        morning: "Good morning! How can I assist you today?",
        afternoon: "Good afternoon! How can I assist you today?",
        evening: "Good evening! How can I assist you today?"
    },
    fr: {
        morning: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
        afternoon: "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
        evening: "Bonsoir ! Comment puis-je vous aider aujourd'hui ?"
    },
    ht: {
        morning: "Bonjou ! Koman mwen ka ede ou jodi a ?",
        afternoon: "Bon apre-midi ! Koman mwen ka ede ou jodi a ?",
        evening: "Bonsoir ! Koman mwen ka ede ou jodi a ?"
    }
};

const creatorMessage = {
    en: "I was created by the Famous Tech Group to assist you with various tasks.",
    fr: "J'ai été créé par le Famous Tech Group pour vous aider avec diverses tâches.",
    ht: "Mwen kreye pa Gwoup Teknoloji Famous pou ede ou ak divès travay."
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
    const countryCode = phoneNumber.substring(0, 3);
    return countryToLanguage[countryCode] || 'en'; // Default to English if country code not found
}

async function generateResponse(text, phoneNumber, isFirstInteraction) {
    const lang = detectLanguage(phoneNumber);
    
    if (isFirstInteraction) {
        return {
            text: initialMessage[lang]
        };
    }

    const lowerText = text.toLowerCase();

    if (lowerText === "1" || lowerText === "oui" || lowerText === "wi") {
        return {
            text: `Here are some suggestions:\n\n1. ${suggestions[lang][0]}\n2. ${suggestions[lang][1]}\n3. ${suggestions[lang][2]}\n4. ${suggestions[lang][3]}\n5. ${suggestions[lang][4]}\n\nReply with the number that suits you.`
        };
    }

    if (lowerText === "2" || lowerText === "non") {
        return {
            text: "Thank you for your interest. If you change your mind, feel free to reach out again."
        };
    }

    if (lowerText === "1" || lowerText.includes("services") || lowerText.includes("sèvis") || lowerText.includes("service")) {
        return {
            text: `Here are the services we offer:\n\n1. ${services[lang][0]}\n2. ${services[lang][1]}\n3. ${services[lang][2]}\n4. ${services[lang][3]}\n5. ${services[lang][4]}\n\nReply with the number that suits you.`
        };
    }

    if (lowerText === "2" || lowerText.includes("recruitment") || lowerText.includes("recrutement") || lowerText.includes("rekritman")) {
        return {
            text: `Here is the link to our recruitment website: ${websiteLinks.recruitment}`
        };
    }

    if (lowerText === "3" || lowerText.includes("services website") || lowerText.includes("site de services") || lowerText.includes("sit sèvis")) {
        return {
            text: `Here is the link to our services website: ${websiteLinks.services}`
        };
    }

    if (lowerText === "4" || lowerText.includes("blog")) {
        return {
            text: `Here is the link to our blog: ${websiteLinks.blog}`
        };
    }

    if (lowerText === "5" || lowerText.includes("hosting") || lowerText.includes("hébergement") || lowerText.includes("hosting")) {
        return {
            text: faq[lang][2], // Réponse sur l'hébergement web
        };
    }

    if (lowerText.includes("bonjour") || lowerText.includes("good morning") || lowerText.includes("salut") || lowerText.includes("hello")) {
        const currentHour = new Date().getHours();
        let greeting;
        if (currentHour >= 5 && currentHour < 12) {
            greeting = greetings[lang].morning;
        } else if (currentHour >= 12 && currentHour < 18) {
            greeting = greetings[lang].afternoon;
        } else {
            greeting = greetings[lang].evening;
        }
        return { text: greeting };
    }

    if (lowerText.includes("who created you") || lowerText.includes("qui t'a créé") || lowerText.includes("ki kreye w")) {
        return { text: creatorMessage[lang] };
    }

    if (lowerText.includes("pricing") || lowerText.includes("prix") || lowerText.includes("pri")) {
        return { text: faq[lang][0] };
    }

    if (lowerText.includes("support") || lowerText.includes("soutien") || lowerText.includes("sèvis kliyan")) {
        return { text: faq[lang][1] };
    }

    if (lowerText.includes("updates") || lowerText.includes("mises à jour") || lowerText.includes("mizajou")) {
        return { text: faq[lang][3] };
    }

    if (lowerText.includes("custom services") || lowerText.includes("services personnalisés") || lowerText.includes("sèvis pèsonalize")) {
        return { text: faq[lang][4] };
    }

    // Nouvelles règles
    if (lowerText.includes("comment ça va") || lowerText.includes("how are you")) {
        return { text: "I'm just an AI, but I'm here to help you!" };
    }

    if (lowerText.includes("contact") || lowerText.includes("contacter") || lowerText.includes("kontakte")) {
        return { text: "You can contact us at support@famous-tech-group.com or call us at +1234567890." };
    }

    if (lowerText.includes("combien coûte") || lowerText.includes("how much does") || lowerText.includes("kijan anko")) {
        return { text: "Our pricing varies depending on the service. Please contact us for a detailed quote." };
    }

    if (lowerText.includes("e-commerce") || lowerText.includes("site de e-commerce") || lowerText.includes("sit e-commerce")) {
        return { text: `For an e-commerce website, our pricing starts at $500. Please contact us for a detailed quote.` };
    }

    if (lowerText.includes("blog") || lowerText.includes("développement de blog") || lowerText.includes("devlopman blog")) {
        return { text: `For a blog development, our pricing starts at $300. Please contact us for a detailed quote.` };
    }

    if (lowerText.includes("phone number") || lowerText.includes("numéro de téléphone") || lowerText.includes("nimewo telefòn")) {
        return { text: "You can reach us at +1234567890." };
    }

    if (lowerText.includes("email") || lowerText.includes("e-mail") || lowerText.includes("imel")) {
        return { text: "You can contact us at support@famous-tech-group.com." };
    }

    if (lowerText.includes("recommend") || lowerText.includes("recommandez") || lowerText.includes("rekòmande")) {
        return { text: `For an e-commerce website, we recommend our "E-commerce Website" service. For a blog, we recommend our "Blog Development" service.` };
    }

    if (lowerText.includes("confirm") || lowerText.includes("confirmer") || lowerText.includes("konfime")) {
        return { text: "Yes, I can confirm that information for you." };
    }

    if (lowerText.includes("when") || lowerText.includes("quand") || lowerText.includes("kan")) {
        return { text: "You can expect a response within 24 hours." };
    }

    if (lowerText.includes("language") || lowerText.includes("langue") || lowerText.includes("lang")) {
        return { text: "I can speak English, French, and Haitian Creole. Which language would you prefer?" };
    }

    return { text: "I don't understand your request. Could you please rephrase?" };
}

export { generateResponse };
