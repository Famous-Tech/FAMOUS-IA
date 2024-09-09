const services = {
    en: [
        "We offer blog development services.",
        "We provide digital marketing solutions.",
        "We offer portfolio creation services.",
        "We provide web development services.",
        "We provide e-commerce development solutions.",
        "We offer graphic design services."
    ],
    fr: [
        "Nous offrons des services de développement de blogs.",
        "Nous fournissons des solutions de marketing digital.",
        "Nous offrons des services de création de portfolio.",
        "Nous fournissons des services de développement web.",
        "Nous proposons des solutions de développement e-commerce.",
        "Nous offrons des services de conception graphique."
    ],
    ht: [
        "Nou bay sèvis devlopman blog.",
        "Nou ofri solisyon maketing dijital.",
        "Nou bay sèvis kreye portfolio.",
        "Nou ofri sèvis devlopman entènèt.",
        "Nou bay solisyon devlopman e-commerce.",
        "Nou ofri sèvis konsepsyon grafik."
    ]
};

const websiteLinks = {
    recruitment: "https://famous-tech-group-recrutements.vercel.app",
    services: "https://famous-tech-group.vercel.app",
    blog: "https://famous-tech-group-blog.vercel.app"
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
    if (/services|recruitment|website|blog|hosting/i.test(text)) {
        return 'en';
    } else if (/services|recrutement|site|blog|hébergement/i.test(text)) {
        return 'fr';
    } else if (/sèvis|rekritman|sit|blog|hosting/i.test(text)) {
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
            headerType: 1
        };
    }

    const lowerText = text.toLowerCase();

    if (lowerText.includes("yes") || lowerText.includes("oui") || lowerText.includes("wi")) {
        return {
            text: `Here are some suggestions:`,
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

    if (lowerText.includes("blog")) {
        return {
            text: `Here is the link to our blog: ${websiteLinks.blog}`
        };
    }

    if (lowerText.includes("hosting")) {
        return {
            text: faq[lang][2], // Réponse sur l'hébergement web
        };
    }

    return { text: "I don't understand your request. Could you please rephrase?" };
}

export { generateResponse };
