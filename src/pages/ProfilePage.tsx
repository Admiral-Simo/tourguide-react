import { useEffect } from "react";
import { apiService } from "../services/apiService";

interface TagsPageProps {
  isAuthenticated: boolean;
}

const ProfilePage: React.FC<TagsPageProps> = ({ isAuthenticated }) => {
  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated) {
        const profile = await apiService.me();
        console.log(profile.createdBy);
      }
    };
    fetchProfile();
  });
  return <div>ProfilePage</div>;
};

export default ProfilePage;
