import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface ContentGenerationRequest {
  keywords: string[];
  contentType: 'blog_post' | 'introduction' | 'conclusion' | 'outline';
  tone?: 'professional' | 'casual' | 'academic' | 'creative';
  length?: 'short' | 'medium' | 'long';
}

export interface ContentStylingRequest {
  content: string;
  targetAudience?: string;
  improvements?: string[];
}

export interface GeneratedContent {
  content: string;
  suggestions?: string[];
}

export interface StyleSuggestions {
  improvedContent: string;
  changes: Array<{
    type: 'grammar' | 'style' | 'structure' | 'engagement';
    original: string;
    improved: string;
    reason: string;
  }>;
  overallScore: number;
  recommendations: string[];
}

class AIService {
  private static instance: AIService;
  private model: any;

  private constructor() {
    if (genAI) {
      this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public isAvailable(): boolean {
    return !!this.model;
  }

  private createContentPrompt(request: ContentGenerationRequest): string {
    const { keywords, contentType, tone = 'professional', length = 'medium' } = request;
    
    const keywordString = keywords.join(', ');
    const lengthGuide = {
      short: '100-200 words',
      medium: '300-500 words', 
      long: '500-800 words'
    };

    const contentTypeInstructions = {
      blog_post: 'Create a complete blog post with engaging introduction, main content, and conclusion',
      introduction: 'Write an engaging introduction that hooks the reader',
      conclusion: 'Write a compelling conclusion that summarizes key points',
      outline: 'Create a detailed outline with main points and subpoints'
    };

    return `
You are a professional content writer. Generate high-quality ${contentType} content based on these keywords: ${keywordString}

Requirements:
- Content type: ${contentTypeInstructions[contentType]}
- Tone: ${tone}
- Length: ${lengthGuide[length]}
- Make it engaging and well-structured
- Use proper formatting with headings and paragraphs
- Ensure the content is original and informative

Keywords to focus on: ${keywordString}

Generate the content now:
`;
  }

  private createStylingPrompt(request: ContentStylingRequest): string {
    const { content, targetAudience = 'general readers', improvements = [] } = request;
    
    const improvementFocus = improvements.length > 0 
      ? `Focus particularly on: ${improvements.join(', ')}` 
      : 'Focus on overall improvement';

    return `
You are a professional content editor. Analyze and improve the following content for ${targetAudience}.

${improvementFocus}

Original content:
"""
${content}
"""

Please provide:
1. An improved version of the content with better flow, clarity, and engagement
2. Specific changes made and why
3. A quality score from 1-10
4. Recommendations for further improvement

Format your response as JSON with this structure:
{
  "improvedContent": "the improved content here",
  "changes": [
    {
      "type": "grammar|style|structure|engagement",
      "original": "original text",
      "improved": "improved text", 
      "reason": "explanation of change"
    }
  ],
  "overallScore": number,
  "recommendations": ["recommendation 1", "recommendation 2"]
}
`;
  }

  public async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    if (!this.model) {
      throw new Error("AI service is not available. Please check your API key configuration.");
    }

    try {
      const prompt = this.createContentPrompt(request);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return {
        content: content.trim(),
        suggestions: [
          "Consider adding more specific examples",
          "You might want to include relevant statistics",
          "Consider adding a call-to-action at the end"
        ]
      };
    } catch (error: any) {
      console.error("Error generating content:", error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  public async styleContent(request: ContentStylingRequest): Promise<StyleSuggestions> {
    if (!this.model) {
      throw new Error("AI service is not available. Please check your API key configuration.");
    }

    try {
      const prompt = this.createStylingPrompt(request);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON response
      try {
        const parsed = JSON.parse(text);
        return parsed;
      } catch (parseError) {
        // If JSON parsing fails, return a formatted response
        return {
          improvedContent: text,
          changes: [],
          overallScore: 7,
          recommendations: [
            "Review the AI-generated improvements",
            "Consider the suggested changes",
            "Maintain your unique voice while improving clarity"
          ]
        };
      }
    } catch (error: any) {
      console.error("Error styling content:", error);
      throw new Error(`Failed to style content: ${error.message}`);
    }
  }

  public async generateKeywordSuggestions(topic: string): Promise<string[]> {
    if (!this.model) {
      return [];
    }

    try {
      const prompt = `Generate 10 relevant keywords for a blog post about: ${topic}. Return only the keywords, separated by commas.`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return text.split(',').map(keyword => keyword.trim()).filter(Boolean);
    } catch (error) {
      console.error("Error generating keyword suggestions:", error);
      return [];
    }
  }
}

export default AIService.getInstance();
