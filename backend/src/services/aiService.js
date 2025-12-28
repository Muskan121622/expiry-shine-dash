const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
    async analyzeProductImage(imageUrl) {
        try {
            console.log('AI: Analyzing image with OpenAI Vision...', imageUrl);

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are an expert product analyst. Your task is to extract product information from packaging images. 
                        
                        Expert Knowledge:
                        - Barcode prefix '762220' or '7622202' is Mondelez/Cadbury (e.g., Gems, Oreo).
                        - Barcode prefix '890' is from India. 
                        - '890103' is Nestle/Maggi.
                        
                        Always return a valid JSON object. If you find a barcode, use your internal knowledge to identify the product even if the label is partially obscured.`
                    },
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: `Extract details from this product image. 
                                Find the barcode number (usually 8-14 digits at the bottom), 
                                the expiry date (look for EXP, Use By, or Best Before), 
                                product name, brand, category, nutrients, and ingredients.
                                
                                Return JSON in this format:
                                {
                                  "barcode": "string",
                                  "expiryDate": "YYYY-MM-DD",
                                  "name": "string",
                                  "brand": "string",
                                  "category": "food|medicine|cosmetic|other",
                                  "nutrients": { "energy": "string", "protein": "string", etc },
                                  "ingredients": "string",
                                  "description": "string"
                                }`
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    "url": imageUrl,
                                    "detail": "high"
                                },
                            },
                        ],
                    },
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            console.log('AI Raw Content:', content);
            const result = JSON.parse(content);

            // Ensure barcode is numeric string (remove spaces, symbols like '>')
            if (result.barcode) {
                result.barcode = result.barcode.toString().replace(/\D/g, '');
            }

            console.log('AI Parsed Result:', result);

            return {
                barcode: result.barcode || null,
                expiryDate: result.expiryDate || null,
                productDetails: result.name ? {
                    name: result.name,
                    brand: result.brand || 'Unknown',
                    category: result.category || 'other',
                    nutrients: result.nutrients || null,
                    ingredients: result.ingredients || null,
                    description: result.description || `Auto-detected ${result.name}`
                } : null
            };
        } catch (error) {
            console.error('AI analysis ERROR:', error.message);
            if (error.response) {
                console.error('OpenAI Response Error:', error.response.data);
            } else if (error.request) {
                console.error('OpenAI Request Error: No response received');
            }
            return null;
        }
    }
}

module.exports = new AIService();
