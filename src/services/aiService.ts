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
You are a professional content writer and web designer. Generate high-quality ${contentType} content based on these keywords: ${keywordString}

Requirements:
- Content type: ${contentTypeInstructions[contentType]}
- Tone: ${tone}
- Length: ${lengthGuide[length]}
- Make it engaging and well-structured
- Use proper formatting with headings and paragraphs
- Ensure the content is original and informative

IMPORTANT: Return ONLY the content in HTML format with inline styles for colors, backgrounds, and formatting. 
Do not include any explanations, JSON, or code blocks.
Make the content visually appealing with:
- Colorful text (use inline style="color: #hexcode")
- Background colors for important sections (use inline style="background-color: #hexcode; padding: 10px; border-radius: 5px")
- Gradient backgrounds where appropriate (use inline style="background: linear-gradient(...)")
- Bold and italic formatting
- Proper paragraph and heading structure
- Engaging visual hierarchy

Keywords to focus on: ${keywordString}

Return only the styled HTML content:
`;
  }

  private createStylingPrompt(request: ContentStylingRequest): string {
    const { content, targetAudience = 'general readers', improvements = [] } = request;
    
    const improvementFocus = improvements.length > 0 
      ? `Focus particularly on: ${improvements.join(', ')}` 
      : 'Focus on overall improvement';

    return `
You are a professional content editor and web designer. Analyze and improve the following content for ${targetAudience}.

${improvementFocus}

Original content:
"""
${content}
"""

IMPORTANT: Return ONLY the improved HTML content with inline styles for colors, backgrounds, and formatting. 
Do not include any explanations, JSON, or code blocks.
Make the content visually appealing with:
- Colorful text (use inline style="color: #hexcode")
- Background colors for important sections (use inline style="background-color: #hexcode; padding: 10px; border-radius: 5px")
- Gradient backgrounds where appropriate (use inline style="background: linear-gradient(...)")
- Bold and italic formatting
- Proper paragraph and heading structure
- Engaging visual hierarchy

Return only the styled HTML content:
`;
  }

  public async generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
    if (!this.model) {
      throw new Error("AI service is not available. Please check your API key configuration.");
    }

    try {
      const prompt = this.createContentPrompt(request);
      console.log("Generating content with prompt:", prompt);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let content = response.text().trim();

      console.log("Raw AI response for content generation:", content);

      // Clean the content of any markdown code blocks or unwanted text
      content = this.cleanStyledContent(content);

      console.log("Cleaned generated content:", content);

      return {
        content: content,
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
      console.log("Styling prompt:", prompt);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let improvedContent = response.text().trim();
      
      console.log("Raw AI response for styling:", improvedContent);
      
      // Clean the content of any markdown code blocks or unwanted text
      improvedContent = this.cleanStyledContent(improvedContent);
      
      console.log("Cleaned improved content:", improvedContent);

      return {
        improvedContent: improvedContent,
        changes: [
          {
            type: 'style',
            original: 'Plain text',
            improved: 'Styled HTML with colors and formatting',
            reason: 'Added visual styling and colors for better engagement'
          }
        ],
        overallScore: 8,
        recommendations: [
          "Content has been enhanced with colors and styling",
          "Visual hierarchy improved with proper formatting",
          "Review the changes and adjust colors as needed"
        ]
      };
    } catch (error: any) {
      console.error("Error styling content:", error);
      throw new Error(`Failed to style content: ${error.message}`);
    }
  }

  private cleanStyledContent(content: string): string {
    // Remove markdown code blocks and clean up the content
    let cleaned = content
      .replace(/```html\s*/gi, '') // Remove opening HTML code blocks
      .replace(/```\s*/g, '') // Remove closing code blocks
      .replace(/^\s*html\s*/gmi, '') // Remove standalone 'html' text
      .replace(/^Here's the.*content.*$/gmi, '') // Remove explanatory text
      .replace(/^The.*content.*$/gmi, '') // Remove explanatory text
      .replace(/^Here is the.*$/gmi, '') // Remove explanatory text
      .replace(/^Below is the.*$/gmi, '') // Remove explanatory text
      .trim();
    
    // Ensure content doesn't start with unwanted prefixes
    if (cleaned.toLowerCase().startsWith('html')) {
      cleaned = cleaned.substring(4).trim();
    }
    
    // Remove any leading explanatory text that might start with common phrases
    const unwantedPrefixes = [
      'here is',
      'here\'s',
      'below is',
      'the content',
      'generated content',
      'html content'
    ];
    
    for (const prefix of unwantedPrefixes) {
      const regex = new RegExp(`^${prefix}[^<]*`, 'i');
      cleaned = cleaned.replace(regex, '').trim();
    }
    
    // If content doesn't start with HTML tags, wrap it in a paragraph
    if (cleaned && !cleaned.startsWith('<')) {
      // Check if it's multiple lines/paragraphs
      const lines = cleaned.split('\n').filter(line => line.trim());
      if (lines.length > 1) {
        cleaned = lines.map(line => `<p>${line.trim()}</p>`).join('\n');
      } else {
        cleaned = `<p>${cleaned}</p>`;
      }
    }
    
    return cleaned;
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
      
      return text.split(',').map((keyword: string) => keyword.trim()).filter(Boolean);
    } catch (error) {
      console.error("Error generating keyword suggestions:", error);
      return [];
    }
  }
}

export default AIService.getInstance();
