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

IMPORTANT: Return ONLY properly formatted HTML content with inline styles. No explanations, no code blocks, no markdown.
Use these styling guidelines:
- Wrap content in proper HTML tags (h1, h2, h3, p, strong, em, ul, li, etc.)
- Add colorful inline styles: style="color: #hexcode"
- Use background colors for emphasis: style="background-color: #hexcode; padding: 8px; border-radius: 4px"
- Add gradients where appropriate: style="background: linear-gradient(135deg, #color1, #color2); padding: 10px; border-radius: 6px"
- Make headings visually appealing with colors and styling
- Use bold and italic formatting strategically
- Create engaging visual hierarchy

Keywords to focus on: ${keywordString}

Generate the styled HTML content now:
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
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let content = response.text().trim();

      // Clean the content of any markdown code blocks or unwanted text
      content = this.cleanStyledContent(content);

      return {
        content: content,
        suggestions: [
          "Review the generated styling and adjust colors as needed",
          "Consider adding more interactive elements or call-to-actions",
          "You might want to include relevant images or media"
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
      .replace(/^Here's the.*$/gmi, '') // Remove explanatory text starting with "Here's"
      .replace(/^The improved.*$/gmi, '') // Remove explanatory text starting with "The improved"
      .replace(/^Here is.*$/gmi, '') // Remove explanatory text starting with "Here is"
      .replace(/^Below is.*$/gmi, '') // Remove explanatory text starting with "Below is"
      .replace(/^This is.*$/gmi, '') // Remove explanatory text starting with "This is"
      .replace(/^\*\*.*\*\*$/gmi, '') // Remove markdown bold explanations
      .replace(/^---+$/gm, '') // Remove markdown horizontal rules
      .trim();
    
    // Remove multiple consecutive newlines
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Ensure content doesn't start with unwanted prefixes
    const unwantedPrefixes = ['html', 'content:', 'output:', 'result:'];
    for (const prefix of unwantedPrefixes) {
      if (cleaned.toLowerCase().startsWith(prefix)) {
        cleaned = cleaned.substring(prefix.length).trim();
        if (cleaned.startsWith(':')) {
          cleaned = cleaned.substring(1).trim();
        }
      }
    }
    
    // If content doesn't start with HTML tags and isn't empty, wrap it in a paragraph
    if (cleaned && !cleaned.startsWith('<') && !cleaned.includes('<')) {
      cleaned = `<p style="color: #2d3748; line-height: 1.6;">${cleaned}</p>`;
    }
    
    // Ensure we have valid HTML structure
    if (cleaned && !cleaned.includes('<')) {
      // If no HTML tags found, treat as plain text and wrap appropriately
      const lines = cleaned.split('\n').filter(line => line.trim());
      cleaned = lines.map(line => `<p style="color: #2d3748; line-height: 1.6; margin-bottom: 1em;">${line.trim()}</p>`).join('');
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
