import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Card,
  CardBody,
  Spinner,
  Divider,
} from "@nextui-org/react";
import {
  Sparkles,
  Plus,
  X,
  Wand2,
  Copy,
  Check,
  Lightbulb,
  Target,
  Type,
  Hash,
} from "lucide-react";
import AIService, { ContentGenerationRequest, GeneratedContent } from "../services/aiService";

interface AIContentGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onContentGenerated: (content: string) => void;
  currentTitle?: string;
}

const AIContentGenerator: React.FC<AIContentGeneratorProps> = ({
  isOpen,
  onClose,
  onContentGenerated,
  currentTitle,
}) => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [currentKeyword, setCurrentKeyword] = useState("");
  const [contentType, setContentType] = useState<'blog_post' | 'introduction' | 'conclusion' | 'outline'>('blog_post');
  const [tone, setTone] = useState<'professional' | 'casual' | 'academic' | 'creative'>('professional');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const handleAddKeyword = () => {
    if (currentKeyword.trim() && !keywords.includes(currentKeyword.trim()) && keywords.length < 10) {
      setKeywords([...keywords, currentKeyword.trim()]);
      setCurrentKeyword("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(k => k !== keywordToRemove));
  };

  const handleKeywordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const generateKeywordsFromTitle = async () => {
    if (!currentTitle) return;
    
    try {
      const suggestions = await AIService.generateKeywordSuggestions(currentTitle);
      const newKeywords = suggestions.slice(0, 5).filter(k => !keywords.includes(k));
      setKeywords([...keywords, ...newKeywords].slice(0, 10));
    } catch (error) {
      console.error("Error generating keyword suggestions:", error);
    }
  };

  const handleGenerate = async () => {
    if (keywords.length === 0) {
      setError("Please add at least one keyword");
      return;
    }

    if (!AIService.isAvailable()) {
      setError("AI service is not available. Please check your API key configuration.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const request: ContentGenerationRequest = {
        keywords,
        contentType,
        tone,
        length,
      };

      const result = await AIService.generateContent(request);
      setGeneratedContent(result);
    } catch (error: any) {
      setError(error.message || "Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseContent = () => {
    if (generatedContent) {
      onContentGenerated(generatedContent.content);
      onClose();
    }
  };

  const handleCopyContent = async () => {
    if (generatedContent) {
      try {
        await navigator.clipboard.writeText(generatedContent.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy content:", error);
      }
    }
  };

  const handleClose = () => {
    setKeywords([]);
    setCurrentKeyword("");
    setGeneratedContent(null);
    setError("");
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="4xl" 
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 pb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>AI Content Generator</span>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-6">
            {/* Keywords Section */}
            <Card className="border border-default-200">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold">Keywords & Topics</h3>
                  </div>
                  {currentTitle && (
                    <Button
                      size="sm"
                      variant="flat"
                      startContent={<Lightbulb size={14} />}
                      onClick={generateKeywordsFromTitle}
                    >
                      Suggest from title
                    </Button>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter keywords (e.g., technology, innovation, future)"
                    value={currentKeyword}
                    onChange={(e) => setCurrentKeyword(e.target.value)}
                    onKeyPress={handleKeywordKeyPress}
                    className="flex-1"
                  />
                  <Button
                    isIconOnly
                    color="primary"
                    variant="flat"
                    onClick={handleAddKeyword}
                    isDisabled={!currentKeyword.trim() || keywords.length >= 10}
                  >
                    <Plus size={16} />
                  </Button>
                </div>
                
                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword) => (
                      <Chip
                        key={keyword}
                        onClose={() => handleRemoveKeyword(keyword)}
                        variant="flat"
                        color="primary"
                        endContent={<X size={12} />}
                      >
                        {keyword}
                      </Chip>
                    ))}
                  </div>
                )}
                
                <div className="text-xs text-default-500">
                  {keywords.length}/10 keywords • Add topics you want the AI to focus on
                </div>
              </CardBody>
            </Card>

            {/* Generation Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Content Type"
                selectedKeys={[contentType]}
                onChange={(e) => setContentType(e.target.value as any)}
                startContent={<Type className="w-4 h-4" />}
              >
                <SelectItem key="blog_post" value="blog_post">
                  Complete Blog Post
                </SelectItem>
                <SelectItem key="introduction" value="introduction">
                  Introduction Only
                </SelectItem>
                <SelectItem key="conclusion" value="conclusion">
                  Conclusion Only
                </SelectItem>
                <SelectItem key="outline" value="outline">
                  Content Outline
                </SelectItem>
              </Select>

              <Select
                label="Tone"
                selectedKeys={[tone]}
                onChange={(e) => setTone(e.target.value as any)}
                startContent={<Target className="w-4 h-4" />}
              >
                <SelectItem key="professional" value="professional">
                  Professional
                </SelectItem>
                <SelectItem key="casual" value="casual">
                  Casual
                </SelectItem>
                <SelectItem key="academic" value="academic">
                  Academic
                </SelectItem>
                <SelectItem key="creative" value="creative">
                  Creative
                </SelectItem>
              </Select>

              <Select
                label="Length"
                selectedKeys={[length]}
                onChange={(e) => setLength(e.target.value as any)}
                startContent={<Wand2 className="w-4 h-4" />}
              >
                <SelectItem key="short" value="short">
                  Short (100-200 words)
                </SelectItem>
                <SelectItem key="medium" value="medium">
                  Medium (300-500 words)
                </SelectItem>
                <SelectItem key="long" value="long">
                  Long (500-800 words)
                </SelectItem>
              </Select>
            </div>

            {/* Error Display */}
            {error && (
              <Card className="border border-danger-200 bg-danger-50">
                <CardBody className="py-3">
                  <div className="flex items-center gap-2 text-danger">
                    <X className="w-4 h-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Generated Content */}
            {generatedContent && (
              <Card className="border border-success-200">
                <CardBody className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-success">Generated Content</h3>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        startContent={copied ? <Check size={14} /> : <Copy size={14} />}
                        onClick={handleCopyContent}
                        color={copied ? "success" : "default"}
                      >
                        {copied ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>
                  
                  <Divider />
                  
                  <div className="max-h-64 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <div 
                        className="text-sm"
                        dangerouslySetInnerHTML={{ __html: generatedContent.content }}
                      />
                    </div>
                  </div>
                  
                  {generatedContent.suggestions && generatedContent.suggestions.length > 0 && (
                    <>
                      <Divider />
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-default-600">AI Suggestions:</h4>
                        <ul className="space-y-1">
                          {generatedContent.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-xs text-default-500 flex items-start gap-2">
                              <Lightbulb className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </CardBody>
              </Card>
            )}
          </div>
        </ModalBody>
        
        <ModalFooter className="pt-2">
          <Button variant="flat" onPress={handleClose}>
            Cancel
          </Button>
          
          {!generatedContent ? (
            <Button
              color="primary"
              onPress={handleGenerate}
              isLoading={isGenerating}
              isDisabled={keywords.length === 0}
              startContent={!isGenerating ? <Sparkles size={16} /> : <Spinner size="sm" />}
            >
              {isGenerating ? "Generating..." : "Generate Content"}
            </Button>
          ) : (
            <Button
              color="success"
              onPress={handleUseContent}
              startContent={<Check size={16} />}
            >
              Use This Content
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AIContentGenerator;
