import { GoogleGenAI } from "@google/genai";

export const generateShotSketch = async (prompt: string, aspectRatio: string = "16:9"): Promise<string | null> => {
    try {
        // Create instance inside the call to ensure fresh environment variables/keys
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const fullPrompt = `A professional film storyboard scamp, hand-drawn with a graphite pencil. 
        Style: Minimalist rough pencil sketch on white paper. 
        Subject: ${prompt}. 
        Details: Loose but purposeful sketchy lines, visible pencil strokes, hatching for shadows, architectural sketching style, high contrast, black and white only. 
        Avoid photorealism. It should look like hand-drawn art on paper. 
        Strictly NO 3D renders, NO photos, NO text, NO labels, and NO color.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: fullPrompt }],
            },
            config: {
                 imageConfig: {
                    aspectRatio: aspectRatio as any
                 }
            }
        });

        if (response.candidates && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error("Gemini generation error:", error);
        return null;
    }
};