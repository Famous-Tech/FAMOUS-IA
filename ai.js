const services = {
    en: [
        "We offer blog development services.",
        "We provide digital marketing solutions.",
        "We offer portfolio creation services.",
        "We provide web development services."
    ],
    fr: [
        "Nous offrons des services de conseil en gestion.",
        "Nous fournissons des solutions de marketing digital.",
        "Nous offrons des services de développement web."
    ],
    ht: [
        "Nou bay sèvis konsiltasyon jesyon.",
        "Nou ofri solisyon maketing dijital.",        
        "Nou bay sèvis devlopman sit entènèt."
    ]
};

const websiteLinks = {
    recruitment: "https://famous-tech-group-recrutements.vercel.app",
    services: "https://famous-tech-group.vercel.app"
};

const initialMessage = {
    en: "I'm currently unavailable. Would you like to talk to my AI assistant?",
    fr: "Je ne suis pas disponible pour le moment. Souhaitez-vous parler à mon intelligence artificielle ?",
    ht: "Mwen pa disponib kounye a. Èske ou ta renmen pale ak asistan AI mwen an?"
};

const suggestions = {
    en: [
        "What services do you offer?",
        "What is the link to your recruitment website?",
        "What is the link to your services website?"
    ],
    fr: [
        "Quels services offrez-vous ?",
        "Quel est le lien de votre site Web de recrutement ?",
        "Quel est le lien de votre site de services ?"
    ],
    ht: [
        "Ki sèvis ou ofri?",
        "Ki lyen sit wèb rekritman ou a?",
        "Ki lyen sit entènèt sèvis ou a?"
    ]
};

// Générer des boutons interactifs
function generateButtons(buttonTextArray) {
    return buttonTextArray.map((buttonText, index) => ({
        buttonId: `id_button_${index + 1}`, // Identifiant unique pour chaque bouton
        buttonText: { displayText: buttonText },
        type: 1
    }));
}

// Détecter la langue du texte
function detectLanguage(text) {
    if (/services|recruitment|site/i.test(text)) {
        return 'en';
    } else if (/services|recrutement|site/i.test(text)) {
        return 'fr';
    } else if (/sèvis|rekritman|sit/i.test(text)) {
        return 'ht';
    }
    // Default language
    return 'en';
}

async function generateResponse(text, isFirstInteraction) {
    const lang = detectLanguage(text);
    
    if (isFirstInteraction) {
        return {
            text: initialMessage[lang],
            buttons: generateButtons(["Yes", "No"]),
            headerType: 1 // Type d'en-tête pour les boutons
        };
    }

    const lowerText = text.toLowerCase();

    if (lowerText.includes("yes") || lowerText.includes("oui") || lowerText.includes("wi")) {
        return {
            text: `Of course, I'm here to assist you. Here are some suggestions:`,
            buttons: generateButtons(suggestions[lang]),
            headerType: 1
        };
    }

    if (lowerText.includes("services")) {
        return {
            text: `Here are the services we offer:`,
            buttons: generateButtons(services[lang]),
            headerType: 1
        };
    }

    if (lowerText.includes("recruitment") || lowerText.includes("recrutement") || lowerText.includes("rekritman")) {
        return {
            text: `Here is the link to our recruitment website: ${websiteLinks.recruitment}`
        };
    }

    if (lowerText.includes("services website") || lowerText.includes("site de services") || lowerText.includes("sit sèvis")) {
        return {
            text: `Here is the link to our services website: ${websiteLinks.services}`
        };
    }

    return { text: "I don't understand your request. Could you please rephrase?" };
}

export { generateResponse };
