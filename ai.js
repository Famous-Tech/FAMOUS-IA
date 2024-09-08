const services = [
    "Nous offrons des services de conseil en gestion.",
    "Nous fournissons des solutions de marketing digital.",
    "Nous proposons des formations en leadership.",
    "Nous offrons des services de développement web."
];

const websiteLinks = {
    recruitment: "https://famous-tech-group-recrutements.vercel.app",
    services: "https://famous-tech-group.vercel.app"
};

const initialMessage = "Je ne suis pas disponible pour le moment. Souhaitez-vous parler à mon intelligence artificielle ?";

const suggestions = [
    "Quels services offrez-vous ?",
    "Quel est le lien de votre site Web de recrutement ?",
    "Quel est le lien de votre site de services ?"
];

async function generateResponse(text, isFirstInteraction) {
    if (isFirstInteraction) {
        return initialMessage;
    }

    const lowerText = text.toLowerCase();

    if (lowerText.includes("oui")) {
        return `Bien sûr, je suis là pour vous aider. Voici quelques suggestions :\n- ${suggestions.join('\n- ')}`;
    }

    if (lowerText.includes("services")) {
        return `Voici les services que nous offrons :\n- ${services.join('\n- ')}`;
    }

    if (lowerText.includes("recrutement")) {
        return `Voici le lien de notre site Web de recrutement : ${websiteLinks.recruitment}`;
    }

    if (lowerText.includes("services")) {
        return `Voici le lien de notre site de services : ${websiteLinks.services}`;
    }

    return "Je ne comprends pas votre demande. Pouvez-vous reformuler ?";
}

module.exports = { generateResponse };
