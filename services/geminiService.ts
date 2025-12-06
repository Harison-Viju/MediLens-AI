import { GoogleGenAI, Type } from "@google/genai";
import { MedicalAnalysis, Language } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File/Blob to Base64 (for Audio)
export const fileToGenerativePart = async (file: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to process images: Convert to JPEG and Resize
const processImage = async (file: File): Promise<{ data: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Resize to reasonable max dimension to ensure API acceptance and speed
      const MAX_DIMENSION = 1536; 
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context failed"));
        return;
      }

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to JPEG
      const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
      const base64Data = dataUrl.split(",")[1];
      resolve({ data: base64Data, mimeType: "image/jpeg" });
    };
    
    img.onerror = (error) => reject(new Error("Failed to load image for processing"));
    
    // Create URL from file
    img.src = URL.createObjectURL(file);
  });
};

export const analyzeMedicalInput = async (
  imageFile: File | null,
  audioBlob: Blob | null,
  textDescription: string,
  language: Language
): Promise<MedicalAnalysis> => {
  try {
    const parts: any[] = [];

    // Add Text Prompt
    let prompt = `Analyze this medical scenario. Language: ${language}.`;
    if (textDescription) {
      prompt += ` Patient description: "${textDescription}".`;
    }
    if (audioBlob) {
        prompt += ` Listen to the patient's voice description for context.`;
    }
    
    parts.push({ text: prompt });

    // Add Image
    if (imageFile) {
      // Process image to ensure supported MIME type (JPEG) and optimized size
      const { data, mimeType } = await processImage(imageFile);
      parts.push({
        inlineData: {
          data: data,
          mimeType: mimeType,
        },
      });
    }

    // Add Audio
    if (audioBlob) {
      const audioData = await fileToGenerativePart(audioBlob);
      parts.push({
        inlineData: {
          data: audioData,
          mimeType: "audio/wav", // Assuming wav from MediaRecorder, Gemini handles most standard formats
        },
      });
    }

    // JSON Schema for Structured Output
    const schema = {
      type: Type.OBJECT,
      properties: {
        condition_name: { type: Type.STRING },
        severity_score: { type: Type.INTEGER },
        urgency_level: { type: Type.STRING, enum: ["Routine", "Monitor", "Urgent", "Emergency"] },
        summary: { type: Type.STRING },
        medical_reasoning: { type: Type.STRING },
        immediate_actions: { type: Type.ARRAY, items: { type: Type.STRING } },
        questions_for_doctor: { type: Type.ARRAY, items: { type: Type.STRING } },
        disclaimer: { type: Type.STRING },
      },
      required: ["condition_name", "severity_score", "urgency_level", "summary", "immediate_actions", "disclaimer"],
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using Flash for fast multimodal processing
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4, // Lower temperature for more analytical/medical accuracy
      },
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    const result: MedicalAnalysis = JSON.parse(response.text);
    return result;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};
