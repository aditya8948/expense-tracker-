const axios = require("axios");

const ALLOWED_CATEGORIES = [
    "Food",
    "Petrol",
    "Salary",
    "Movie",
    "Shopping",
    "Bills",
    "Other"
];

const callGeminiModel = async (model, description, apiKey) => {
    const prompt = `Categorize this expense: "${description.trim()}". Options: Food, Petrol, Salary, Movie, Shopping, Bills, Other. Reply ONLY with the exact category name in one word.`;
    const url = `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`;

    const response = await axios.post(
        url,
        {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ]
        },
        {
            headers: {
                "Content-Type": "application/json"
            },
            timeout: 5000
        }
    );

    const rawCategory = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!rawCategory) {
        return null;
    }

    const cleanedCategory = rawCategory.replace(/[^a-zA-Z]/g, "").toLowerCase();
    const matched = ALLOWED_CATEGORIES.find(
        (c) => c.toLowerCase() === cleanedCategory
    );

    return matched || null;
};

const suggestCategory = async (description) => {
    if (!description || !description.trim()) {
        return "Other";
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return "Other";
    }

    const models = [
        "models/gemini-3.1-flash-lite-preview",
        "models/gemini-3.5-flash-lite",
        "models/gemini-3.6-flash",
        "models/gemini-flash-lite-latest",
        "models/gemini-3.8-flash"
    ];

    for (const model of models) {
        try {
            const category = await callGeminiModel(model, description, apiKey);
            if (category) {
                return category;
            }
        } catch (err) {
            console.error(`AI model ${model} error:`, err.message);
        }
    }

    return "Other";
};

module.exports = {
    suggestCategory
};
