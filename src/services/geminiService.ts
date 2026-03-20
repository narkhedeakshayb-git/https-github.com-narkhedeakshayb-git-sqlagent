import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface SQLAnalysis {
  differences: string[];
  filters: string[];
  estimatedRecordCount: string;
  optimizations: string[];
}

export async function analyzeSQL(sql1: string, sql2: string): Promise<SQLAnalysis> {
  const prompt = `
    Compare the following two SQL queries and provide a detailed analysis.
    
    SQL 1:
    ${sql1}
    
    SQL 2:
    ${sql2}
    
    Identify:
    1. Key differences in logic, tables, or columns.
    2. All filters (WHERE clauses) used in both.
    3. An estimate of the record count complexity (e.g., "High", "Low", or a range if possible based on LIMIT/JOINs).
    4. Potential optimizations.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          differences: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of logical differences between the queries."
          },
          filters: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of unique filters found across both queries."
          },
          estimatedRecordCount: {
            type: Type.STRING,
            description: "A qualitative or quantitative estimate of record count impact."
          },
          optimizations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Suggested optimizations for either query."
          }
        },
        required: ["differences", "filters", "estimatedRecordCount", "optimizations"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return {
      differences: ["Error analyzing queries"],
      filters: [],
      estimatedRecordCount: "Unknown",
      optimizations: []
    };
  }
}
