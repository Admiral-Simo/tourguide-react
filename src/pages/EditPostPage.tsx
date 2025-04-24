import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardBody, CardHeader, Button, Divider } from "@nextui-org/react";
import { ArrowLeft } from "lucide-react";
import {
  apiService,
  Post,
  Category,
  Tag,
  PostStatus,
} from "../services/apiService";
import PostForm from "../components/PostForm";

const EditPostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [categoriesResponse, tagsResponse] = await Promise.all([
          apiService.getCategories(),
          apiService.getTags(),
        ]);

        setCategories(categoriesResponse);
        setTags(tagsResponse);

        if (id) {
          const postResponse = await apiService.getPost(id);
          setPost(postResponse);
        }

        setError(null);
      } catch (err) {
        setError("Failed to load necessary data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (postData: {
    title: string;
    content: string;
    categoryId: string;
    tagIds: string[];
    status: PostStatus;
  }) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (id) {
        await apiService.updatePost(id, {
          ...postData,
          id,
        });
      } else {
        await apiService.createPost(postData);
      }

      navigate("/");
    } catch (err) {
      setError("Failed to save the post. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (id) {
      navigate(`/posts/${id}`);
    } else {
      navigate("/");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4">
        <Card className="w-full animate-pulse">
          <CardBody>
            <div className="h-8 bg-default-200 rounded w-3/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-default-200 rounded w-full"></div>
              <div className="h-4 bg-default-200 rounded w-full"></div>
              <div className="h-4 bg-default-200 rounded w-2/3"></div>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <Card className="w-full backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border border-default-200 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow">
        <CardHeader className="flex justify-between items-center p-6">
          <div className="flex items-center gap-4">
            <Button
              variant="light"
              startContent={<ArrowLeft size={16} />}
              onClick={handleCancel}
              size="sm"
              className="hover:scale-105 transition-transform"
            >
              Back
            </Button>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              {id ? "Edit Post" : "Create New Post"}
            </h1>
          </div>
        </CardHeader>

        <Divider />

        <CardBody className="p-6">
          {error && (
            <div className="mb-6 p-4 text-sm text-red-600 bg-red-100 border border-red-300 rounded-lg">
              {error}
            </div>
          )}

          <PostForm
            initialPost={post}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            categories={categories}
            availableTags={tags}
            isSubmitting={isSubmitting}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default EditPostPage;
