import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Chip,
  SelectSection,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Tabs,
  Tab,
  Divider,
  Progress,
} from "@nextui-org/react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Undo,
  Redo,
  List,
  ListOrdered,
  ChevronDown,
  X,
  FileText,
  Tags,
  MapPin,
  Eye,
  Save,
  Type,
  Sparkles,
  Palette,
} from "lucide-react";
import { Post, Category, Tag, PostStatus } from "../services/apiService";
import { CreateUpdatePostMapComponent } from "./CreateUpdatePostMapComponent";
import AIContentGenerator from "./AIContentGenerator";
import AIContentStyling from "./AIContentStyling";

interface PostFormProps {
  initialPost?: Post | null;
  onSubmit: (postData: {
    title: string;
    content: string;
    categoryId: string;
    tagIds: string[];
    status: PostStatus;
    latitude: number; // Latitude of the post location
    longitude: number; // Longitude of the post location
  }) => Promise<void>;
  onCancel: () => void;
  categories: Category[];
  availableTags: Tag[];
  isSubmitting?: boolean;
}

const PostForm: React.FC<PostFormProps> = ({
  initialPost,
  onSubmit,
  onCancel,
  categories,
  availableTags,
  isSubmitting = false,
}) => {
  const [title, setTitle] = useState(initialPost?.title || "");
  const [categoryId, setCategoryId] = useState(initialPost?.category?.id || "");
  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    initialPost?.tags || [],
  );
  const [status, setStatus] = useState<PostStatus>(
    initialPost?.status || PostStatus.DRAFT,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState("content");
  const [lat, setLat] = useState<number | undefined>(initialPost?.latitude);
  const [lng, setLng] = useState<number | undefined>(initialPost?.longitude);

  // AI modal states
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [isAIStylingOpen, setIsAIStylingOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Disable default heading to use our custom config
        bulletList: false, // Disable default list to use our custom config
        orderedList: false, // Disable default list to use our custom config
      }),
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList.configure({
        keepMarks: true,
        keepAttributes: false,
      }),
      OrderedList.configure({
        keepMarks: true,
        keepAttributes: false,
      }),
      ListItem,
      // Text styling extensions for AI-generated content
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Underline,
    ],
    content: initialPost?.content || "",
    editorProps: {
      attributes: {
        class:
          "prose max-w-none focus:outline-none min-h-[400px] px-4 py-2 border rounded-lg",
      },
    },
  });

  useEffect(() => {
    if (initialPost && editor) {
      setTitle(initialPost.title);
      editor.commands.setContent(initialPost.content);
      setCategoryId(initialPost.category?.id);
      setSelectedTags(initialPost.tags);
      setStatus(initialPost.status || PostStatus.DRAFT);
    }
  }, [initialPost, editor]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (lat == null || lng == null) {
      newErrors.location = "The location is required";
    }
    if (!title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!editor?.getHTML() || editor?.getHTML() === "<p></p>") {
      newErrors.content = "Content is required";
    }
    if (!categoryId) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const locationSelectHandler = (lat: number, lng: number) => {
    setLat(lat);
    setLng(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit({
      title: title.trim(),
      content: editor?.getHTML() || "",
      categoryId: categoryId,
      tagIds: selectedTags.map((tag) => tag.id),
      status,
      latitude: lat!,
      longitude: lng!,
    });
  };

  const handleTagAdd = (tag: Tag) => {
    if (tag && !selectedTags.includes(tag) && selectedTags.length < 10) {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleTagRemove = (tagToRemove: Tag) => {
    setSelectedTags(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  const handleHeadingSelect = (level: number) => {
    editor
      ?.chain()
      .focus()
      .toggleHeading({ level: level as 1 | 2 | 3 })
      .run();
  };

  // AI callback functions
  const handleAIContentGenerated = (content: string) => {
    console.log("Received generated content:", content);
    if (editor && content) {
      try {
        // Clean and validate the HTML content
        const cleanContent = content.trim();

        // Check if editor is empty or has minimal content
        const currentContent = editor.getHTML();
        const isEmpty =
          !currentContent ||
          currentContent === "<p></p>" ||
          currentContent.trim() === "";

        if (isEmpty) {
          // Replace all content with new generated content
          console.log("Setting new content (editor was empty)");
          editor.commands.setContent(cleanContent, false);
        } else {
          // Append new content with proper spacing
          console.log("Appending content to existing content");
          editor.commands.insertContent("<br><br>" + cleanContent);
        }

        // Focus the editor
        setTimeout(() => {
          editor.commands.focus("end");
        }, 100);

        console.log("Generated content applied successfully");
      } catch (error) {
        console.error("Error applying generated content:", error);
        // Fallback: basic insertion
        editor.commands.insertContent(content);
      }
    }
    setIsAIGeneratorOpen(false);
  };

  const handleAIContentImproved = (improvedContent: string) => {
    console.log("Received improved content:", improvedContent);
    if (editor && improvedContent && improvedContent.trim()) {
      try {
        // Clean the content first
        const cleanContent = improvedContent.trim();
        console.log("Clean improved content:", cleanContent);

        // Use TipTap's setContent with proper HTML handling
        console.log("Using TipTap setContent for HTML content");
        editor.commands.setContent(cleanContent, false);

        // Ensure the content is properly rendered
        setTimeout(() => {
          // Force a re-render and focus
          editor.commands.focus("end");
          console.log(
            "Content set successfully. Final HTML:",
            editor.getHTML(),
          );
        }, 100);
      } catch (error) {
        console.error("Error applying improved content:", error);
        // Fallback: basic setContent
        editor.commands.setContent(improvedContent);
      }
    } else {
      console.warn("Improved content is empty or editor not available");
    }
    setIsAIStylingOpen(false);
  };

  const suggestedTags = availableTags
    .filter((tag) => !selectedTags.includes(tag))
    .slice(0, 5);

  // Calculate form completion percentage
  const calculateProgress = () => {
    let completed = 0;
    const total = 5; // title, content, category, location, tags (optional)

    if (title.trim()) completed++;
    if (editor?.getHTML() && editor?.getHTML() !== "<p></p>") completed++;
    if (categoryId) completed++;
    if (lat !== undefined && lng !== undefined) completed++;
    if (selectedTags.length > 0) completed++; // Optional but counts toward progress

    return (completed / total) * 100;
  };

  const progressPercentage = calculateProgress();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header with Progress */}
      <Card className="overflow-visible">
        <CardHeader className="flex flex-col gap-4 pb-2">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  {initialPost ? "Edit Post" : "Create New Post"}
                </h2>
                <p className="text-small text-default-500">
                  {initialPost
                    ? "Update your post details"
                    : "Share your story with the world"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-small text-default-500">
                {Math.round(progressPercentage)}% complete
              </span>
              <Progress
                value={progressPercentage}
                className="w-20"
                color="primary"
                size="sm"
              />
            </div>
          </div>
        </CardHeader>

        <CardBody className="pt-0">
          <Tabs
            selectedKey={currentTab}
            onSelectionChange={(key) => setCurrentTab(key as string)}
            variant="underlined"
            classNames={{
              tabList:
                "gap-6 w-full relative rounded-none p-0 border-b border-divider",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12",
              tabContent: "group-data-[selected=true]:text-primary",
            }}
          >
            <Tab
              key="content"
              title={
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  <span>Content</span>
                  {title.trim() &&
                    editor?.getHTML() &&
                    editor?.getHTML() !== "<p></p>" && (
                      <div className="w-2 h-2 bg-success rounded-full" />
                    )}
                </div>
              }
            >
              <div className="space-y-6 py-4">
                {/* Title Section */}
                <div className="space-y-2">
                  <Input
                    label="Post Title"
                    placeholder="Enter an engaging title for your post..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    isInvalid={!!errors.title}
                    errorMessage={errors.title}
                    isRequired
                    size="lg"
                    classNames={{
                      input: "text-lg",
                      inputWrapper: "h-14",
                    }}
                  />
                </div>

                {/* Rich Text Editor */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-foreground">
                      Content <span className="text-danger">*</span>
                    </label>
                    <div className="text-xs text-default-500">
                      Use the toolbar below to format your content
                    </div>
                  </div>

                  {/* Enhanced Toolbar */}
                  <Card className="border border-default-200 shadow-sm">
                    <CardBody className="p-3">
                      <div className="flex gap-1 flex-wrap items-center">
                        <Dropdown>
                          <DropdownTrigger>
                            <Button
                              variant="flat"
                              size="sm"
                              endContent={<ChevronDown size={14} />}
                              className="min-w-20"
                            >
                              {editor?.isActive("heading", { level: 1 })
                                ? "H1"
                                : editor?.isActive("heading", { level: 2 })
                                  ? "H2"
                                  : editor?.isActive("heading", { level: 3 })
                                    ? "H3"
                                    : "Text"}
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu
                            onAction={(key) => handleHeadingSelect(Number(key))}
                            aria-label="Text formatting"
                          >
                            <DropdownItem key="0">Normal Text</DropdownItem>
                            <DropdownItem key="1">Heading 1</DropdownItem>
                            <DropdownItem key="2">Heading 2</DropdownItem>
                            <DropdownItem key="3">Heading 3</DropdownItem>
                          </DropdownMenu>
                        </Dropdown>

                        <Divider orientation="vertical" className="h-6 mx-1" />

                        <Button
                          size="sm"
                          isIconOnly
                          variant={editor?.isActive("bold") ? "solid" : "flat"}
                          color={
                            editor?.isActive("bold") ? "primary" : "default"
                          }
                          onClick={() =>
                            editor?.chain().focus().toggleBold().run()
                          }
                        >
                          <Bold size={14} />
                        </Button>
                        <Button
                          size="sm"
                          isIconOnly
                          variant={
                            editor?.isActive("italic") ? "solid" : "flat"
                          }
                          color={
                            editor?.isActive("italic") ? "primary" : "default"
                          }
                          onClick={() =>
                            editor?.chain().focus().toggleItalic().run()
                          }
                        >
                          <Italic size={14} />
                        </Button>

                        <Divider orientation="vertical" className="h-6 mx-1" />

                        <Button
                          size="sm"
                          isIconOnly
                          variant={
                            editor?.isActive("bulletList") ? "solid" : "flat"
                          }
                          color={
                            editor?.isActive("bulletList")
                              ? "primary"
                              : "default"
                          }
                          onClick={() =>
                            editor?.chain().focus().toggleBulletList().run()
                          }
                        >
                          <List size={14} />
                        </Button>
                        <Button
                          size="sm"
                          isIconOnly
                          variant={
                            editor?.isActive("orderedList") ? "solid" : "flat"
                          }
                          color={
                            editor?.isActive("orderedList")
                              ? "primary"
                              : "default"
                          }
                          onClick={() =>
                            editor?.chain().focus().toggleOrderedList().run()
                          }
                        >
                          <ListOrdered size={14} />
                        </Button>

                        <Divider orientation="vertical" className="h-6 mx-1" />

                        <Button
                          size="sm"
                          isIconOnly
                          variant="flat"
                          onClick={() => editor?.chain().focus().undo().run()}
                          isDisabled={!editor?.can().undo()}
                        >
                          <Undo size={14} />
                        </Button>
                        <Button
                          size="sm"
                          isIconOnly
                          variant="flat"
                          onClick={() => editor?.chain().focus().redo().run()}
                          isDisabled={!editor?.can().redo()}
                        >
                          <Redo size={14} />
                        </Button>
                      </div>
                    </CardBody>
                  </Card>

                  {/* AI Content Tools */}
                  <Card className="border border-primary-200 bg-gradient-to-r from-primary-50 to-secondary-50 shadow-sm">
                    <CardBody className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            AI Writing Assistant
                          </span>
                        </div>
                        <div className="text-xs text-default-500">
                          Created by mohamed khalis student at estbm
                        </div>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          size="sm"
                          variant="flat"
                          color="primary"
                          startContent={<Sparkles size={14} />}
                          onClick={() => setIsAIGeneratorOpen(true)}
                          className="bg-primary-100 hover:bg-primary-200"
                        >
                          Generate Content
                        </Button>
                        <Button
                          size="sm"
                          variant="flat"
                          color="secondary"
                          startContent={<Palette size={14} />}
                          onClick={() => setIsAIStylingOpen(true)}
                          isDisabled={
                            !editor?.getHTML() ||
                            editor?.getHTML() === "<p></p>"
                          }
                          className="bg-secondary-100 hover:bg-secondary-200"
                        >
                          Improve Style
                        </Button>
                      </div>
                    </CardBody>
                  </Card>

                  <div className="border border-default-200 rounded-lg overflow-hidden">
                    <EditorContent
                      editor={editor}
                      className="prose max-w-none min-h-[400px] p-4 focus-within:ring-2 focus-within:ring-primary focus-within:ring-opacity-20"
                    />
                  </div>
                  {errors.content && (
                    <div className="text-danger text-sm flex items-center gap-1 mt-1">
                      <X size={14} />
                      {errors.content}
                    </div>
                  )}
                </div>
              </div>
            </Tab>

            <Tab
              key="organization"
              title={
                <div className="flex items-center gap-2">
                  <Tags className="w-4 h-4" />
                  <span>Organization</span>
                  {categoryId && selectedTags.length > 0 && (
                    <div className="w-2 h-2 bg-success rounded-full" />
                  )}
                </div>
              }
            >
              <div className="space-y-6 py-4">
                {/* Category Selection */}
                <div className="space-y-2">
                  <Select
                    label="Category"
                    placeholder="Select a category for your post"
                    selectedKeys={categoryId ? [categoryId] : []}
                    onChange={(e) => setCategoryId(e.target.value)}
                    isInvalid={!!errors.category}
                    errorMessage={errors.category}
                    isRequired
                    size="lg"
                  >
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Tags Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-foreground">
                      Tags
                    </label>
                    <div className="text-xs text-default-500">
                      {selectedTags.length}/10 tags selected
                    </div>
                  </div>

                  {/* Tag Selection */}
                  <Select
                    label="Add Tags"
                    placeholder="Choose relevant tags for your post"
                    selectedKeys={selectedTags.map((tag) => tag.id)}
                    selectionMode="multiple"
                  >
                    <SelectSection title="Suggested Tags">
                      {suggestedTags.map((tag) => (
                        <SelectItem
                          key={tag.id}
                          value={tag.id}
                          onClick={() => handleTagAdd(tag)}
                        >
                          {tag.name}
                        </SelectItem>
                      ))}
                    </SelectSection>
                  </Select>

                  {/* Selected Tags Display */}
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-default-50 rounded-lg">
                      {selectedTags.map((tag) => (
                        <Chip
                          key={tag.id}
                          onClose={() => handleTagRemove(tag)}
                          variant="flat"
                          color="primary"
                          endContent={<X size={14} />}
                        >
                          {tag.name}
                        </Chip>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Tab>

            <Tab
              key="location"
              title={
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Location</span>
                  {lat !== undefined && lng !== undefined && (
                    <div className="w-2 h-2 bg-success rounded-full" />
                  )}
                </div>
              }
            >
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-foreground">
                      Post Location <span className="text-danger">*</span>
                    </label>
                    <div className="text-xs text-default-500">
                      Click on the map to select location
                    </div>
                  </div>

                  <Card className="border border-default-200">
                    <CardBody className="p-0">
                      <CreateUpdatePostMapComponent
                        initialLat={lat}
                        initialLng={lng}
                        onLocationSelect={locationSelectHandler}
                      />
                    </CardBody>
                  </Card>

                  {errors.location && (
                    <div className="text-danger text-sm flex items-center gap-1 mt-1">
                      <X size={14} />
                      {errors.location}
                    </div>
                  )}

                  {lat !== undefined && lng !== undefined && (
                    <div className="p-3 bg-success-50 rounded-lg">
                      <div className="text-xs text-success-700">
                        Selected coordinates: {lat.toFixed(4)}, {lng.toFixed(4)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Tab>

            <Tab
              key="settings"
              title={
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>Settings</span>
                </div>
              }
            >
              <div className="space-y-6 py-4">
                {/* Status Selection */}
                <div className="space-y-2">
                  <Select
                    label="Publication Status"
                    placeholder="Choose publication status"
                    selectedKeys={[status]}
                    onChange={(e) => setStatus(e.target.value as PostStatus)}
                    size="lg"
                  >
                    <SelectItem key={PostStatus.DRAFT} value={PostStatus.DRAFT}>
                      📝 Draft - Save as draft for later
                    </SelectItem>
                    <SelectItem
                      key={PostStatus.PUBLISHED}
                      value={PostStatus.PUBLISHED}
                    >
                      🌍 Published - Make it live immediately
                    </SelectItem>
                  </Select>
                </div>

                {/* Form Summary */}
                <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200">
                  <CardBody className="p-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-primary">
                        Post Summary
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="text-default-600">Title:</div>
                          <div className="font-medium truncate">
                            {title || "Not set"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-default-600">Category:</div>
                          <div className="font-medium">
                            {categories.find((cat) => cat.id === categoryId)
                              ?.name || "Not selected"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-default-600">Tags:</div>
                          <div className="font-medium">
                            {selectedTags.length > 0
                              ? `${selectedTags.length} selected`
                              : "None"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-default-600">Location:</div>
                          <div className="font-medium">
                            {lat !== undefined && lng !== undefined
                              ? "Set"
                              : "Not set"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </Tab>
          </Tabs>

          {/* Action Buttons */}
          <Divider className="my-6" />
          <div className="flex justify-between items-center pt-2">
            <Button
              color="danger"
              variant="flat"
              onClick={onCancel}
              disabled={isSubmitting}
              startContent={<X size={16} />}
            >
              Cancel
            </Button>

            <div className="flex gap-2">
              {currentTab !== "settings" && (
                <Button
                  variant="flat"
                  onClick={() => setCurrentTab("settings")}
                  startContent={<Eye size={16} />}
                >
                  Review & Publish
                </Button>
              )}
              <Button
                color="primary"
                type="submit"
                isLoading={isSubmitting}
                startContent={!isSubmitting ? <Save size={16} /> : undefined}
              >
                {initialPost ? "Update Post" : "Create Post"}
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* AI Content Generator Modal */}
      <AIContentGenerator
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onContentGenerated={handleAIContentGenerated}
        currentTitle={title}
      />

      {/* AI Content Styling Modal */}
      <AIContentStyling
        isOpen={isAIStylingOpen}
        onClose={() => setIsAIStylingOpen(false)}
        content={editor?.getHTML() || ""}
        onContentImproved={handleAIContentImproved}
      />
    </form>
  );
};

export default PostForm;
