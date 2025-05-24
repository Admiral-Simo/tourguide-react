import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Select,
  SelectItem,
  Chip,
  Progress,
  Divider,
  Tabs,
  Tab,
  Spinner,
} from "@nextui-org/react";
import {
  Palette,
  Wand2,
  Check,
  X,
  TrendingUp,
  Eye,
  Lightbulb,
  FileText,
  ArrowRight,
} from "lucide-react";
import AIService, { ContentStylingRequest, StyleSuggestions } from "../services/aiService";

interface AIContentStylingProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  onContentImproved: (improvedContent: string) => void;
}

const AIContentStyling: React.FC<AIContentStylingProps> = ({
  isOpen,
  onClose,
  content,
  onContentImproved,
}) => {
  const [targetAudience, setTargetAudience] = useState("general readers");
  const [selectedImprovements, setSelectedImprovements] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stylingSuggestions, setStylingSuggestions] = useState<StyleSuggestions | null>(null);
  const [error, setError] = useState<string>("");
  const [currentTab, setCurrentTab] = useState("preview");

  const improvementOptions = [
    { key: "clarity", label: "Clarity & Readability" },
    { key: "engagement", label: "Reader Engagement" },
    { key: "flow", label: "Content Flow" },
    { key: "grammar", label: "Grammar & Style" },
    { key: "structure", label: "Structure & Organization" },
    { key: "tone", label: "Tone Consistency" },
  ];

  const audienceOptions = [
    { key: "general", label: "General Readers" },
    { key: "professionals", label: "Industry Professionals" },
    { key: "students", label: "Students & Academics" },
    { key: "beginners", label: "Beginners/Newcomers" },
    { key: "experts", label: "Subject Matter Experts" },
  ];

  const handleImprovementToggle = (improvement: string) => {
    setSelectedImprovements(prev => 
      prev.includes(improvement) 
        ? prev.filter(i => i !== improvement)
        : [...prev, improvement]
    );
  };

  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError("No content to analyze");
      return;
    }

    if (!AIService.isAvailable()) {
      setError("AI service is not available. Please check your API key configuration.");
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const request: ContentStylingRequest = {
        content,
        targetAudience,
        improvements: selectedImprovements,
      };

      const result = await AIService.styleContent(request);
      setStylingSuggestions(result);
      setCurrentTab("preview");
    } catch (error: any) {
      setError(error.message || "Failed to analyze content");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyChanges = () => {
    if (stylingSuggestions) {
      onContentImproved(stylingSuggestions.improvedContent);
      onClose();
    }
  };

  const handleClose = () => {
    setStylingSuggestions(null);
    setError("");
    setCurrentTab("preview");
    onClose();
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "success";
    if (score >= 6) return "warning";
    return "danger";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 8) return "Excellent";
    if (score >= 6) return "Good";
    if (score >= 4) return "Fair";
    return "Needs Improvement";
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      size="5xl" 
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 pb-2">
          <Palette className="w-5 h-5 text-primary" />
          <span>AI Content Styling & Improvement</span>
        </ModalHeader>
        
        <ModalBody>
          <div className="space-y-6">
            {/* Configuration Section */}
            {!stylingSuggestions && (
              <div className="space-y-4">
                <Card className="border border-default-200">
                  <CardBody className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-primary" />
                      <h3 className="font-semibold">Styling Configuration</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Target Audience"
                        selectedKeys={[targetAudience]}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        placeholder="Select target audience"
                      >
                        {audienceOptions.map((option) => (
                          <SelectItem key={option.key} value={option.key}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">Focus Areas</label>
                        <span className="text-xs text-default-500">
                          {selectedImprovements.length} selected
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {improvementOptions.map((option) => (
                          <Chip
                            key={option.key}
                            variant={selectedImprovements.includes(option.key) ? "solid" : "bordered"}
                            color={selectedImprovements.includes(option.key) ? "primary" : "default"}
                            className="cursor-pointer"
                            onClick={() => handleImprovementToggle(option.key)}
                          >
                            {option.label}
                          </Chip>
                        ))}
                      </div>
                      
                      <div className="text-xs text-default-500">
                        Select areas you want the AI to focus on when improving your content
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* Content Preview */}
                <Card className="border border-default-200">
                  <CardBody>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold">Current Content</h3>
                        <span className="text-xs text-default-500">
                          {content.split(' ').length} words
                        </span>
                      </div>
                      
                      <div className="max-h-40 overflow-y-auto bg-default-50 p-3 rounded-lg">
                        <div className="text-sm text-default-700 whitespace-pre-wrap">
                          {content.substring(0, 500)}
                          {content.length > 500 && "..."}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}

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

            {/* Results Section */}
            {stylingSuggestions && (
              <div className="space-y-4">
                {/* Score Header */}
                <Card className="border border-default-200">
                  <CardBody className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="font-semibold">Content Analysis Complete</h3>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-default-600">Quality Score:</span>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={stylingSuggestions.overallScore * 10}
                              color={getScoreColor(stylingSuggestions.overallScore)}
                              className="w-20"
                              size="sm"
                            />
                            <span className={`text-sm font-medium text-${getScoreColor(stylingSuggestions.overallScore)}`}>
                              {stylingSuggestions.overallScore}/10 - {getScoreLabel(stylingSuggestions.overallScore)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <TrendingUp className="w-8 h-8 text-success" />
                    </div>
                  </CardBody>
                </Card>

                {/* Tabbed Results */}
                <Tabs 
                  selectedKey={currentTab} 
                  onSelectionChange={(key) => setCurrentTab(key as string)}
                  variant="underlined"
                >
                  <Tab
                    key="preview"
                    title={
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span>Improved Content</span>
                      </div>
                    }
                  >
                    <Card className="border border-success-200">
                      <CardBody>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-success">Improved Version</h4>
                            <div className="text-xs text-default-500">
                              {stylingSuggestions.improvedContent.split(' ').length} words
                            </div>
                          </div>
                          
                          <Divider />
                          
                          <div className="max-h-96 overflow-y-auto">
                            <div className="prose prose-sm max-w-none">
                              <div className="whitespace-pre-wrap text-sm">
                                {stylingSuggestions.improvedContent}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </Tab>

                  <Tab
                    key="changes"
                    title={
                      <div className="flex items-center gap-2">
                        <ArrowRight className="w-4 h-4" />
                        <span>Changes Made</span>
                        <Chip size="sm" variant="flat" color="primary">
                          {stylingSuggestions.changes.length}
                        </Chip>
                      </div>
                    }
                  >
                    <div className="space-y-3">
                      {stylingSuggestions.changes.length > 0 ? (
                        stylingSuggestions.changes.map((change, index) => (
                          <Card key={index} className="border border-default-200">
                            <CardBody className="py-3">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Chip size="sm" variant="flat" color="primary">
                                    {change.type}
                                  </Chip>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  <div className="space-y-1">
                                    <div className="font-medium text-danger">Original:</div>
                                    <div className="p-2 bg-danger-50 rounded border-l-2 border-danger-200">
                                      {change.original}
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <div className="font-medium text-success">Improved:</div>
                                    <div className="p-2 bg-success-50 rounded border-l-2 border-success-200">
                                      {change.improved}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="text-xs text-default-600 italic">
                                  {change.reason}
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        ))
                      ) : (
                        <Card className="border border-default-200">
                          <CardBody className="text-center py-8">
                            <div className="text-default-500">
                              No specific changes tracked, but overall improvements were made.
                            </div>
                          </CardBody>
                        </Card>
                      )}
                    </div>
                  </Tab>

                  <Tab
                    key="recommendations"
                    title={
                      <div className="flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        <span>Recommendations</span>
                      </div>
                    }
                  >
                    <Card className="border border-default-200">
                      <CardBody>
                        <div className="space-y-4">
                          <h4 className="font-semibold">Additional Recommendations</h4>
                          
                          {stylingSuggestions.recommendations.length > 0 ? (
                            <ul className="space-y-2">
                              {stylingSuggestions.recommendations.map((recommendation, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <Lightbulb className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                                  <span>{recommendation}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="text-default-500 text-center py-4">
                              No additional recommendations at this time.
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  </Tab>
                </Tabs>
              </div>
            )}
          </div>
        </ModalBody>
        
        <ModalFooter className="pt-2">
          <Button variant="flat" onPress={handleClose}>
            Cancel
          </Button>
          
          {!stylingSuggestions ? (
            <Button
              color="primary"
              onPress={handleAnalyze}
              isLoading={isAnalyzing}
              isDisabled={!content.trim()}
              startContent={!isAnalyzing ? <Wand2 size={16} /> : <Spinner size="sm" />}
            >
              {isAnalyzing ? "Analyzing..." : "Analyze & Improve"}
            </Button>
          ) : (
            <Button
              color="success"
              onPress={handleApplyChanges}
              startContent={<Check size={16} />}
            >
              Apply Improvements
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AIContentStyling;
