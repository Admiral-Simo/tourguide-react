import { useEffect, useState } from "react";
import { ShowPostMapComponent } from "../components/ShowPostMapComponent";
import { apiService, Post } from "../services/apiService";

interface PostInfo {
  id: string;
  lat: number;
  lng: number;
  title: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<PostInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const fetchedPosts = await apiService.getPosts({
          categoryId: undefined,
          tagId: undefined,
        });

        // Convert Post[] -> PostInfo[]
        const mappedPosts: PostInfo[] = fetchedPosts.map((post: Post) => ({
          id: post.id,
          lat: post.latitude,
          lng: post.longitude,
          title: post.title,
        }));

        setPosts(mappedPosts);
        setError(null);
      } catch (err) {
        setError("Failed to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Re-fetch when filters change

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="font-bold text-3xl mb-3">Global Mapping For Articles:</h1>
      <ShowPostMapComponent pixelHeight={700} posts={posts} />
    </div>
  );
}
