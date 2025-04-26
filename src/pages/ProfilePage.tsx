"use client";

import { useEffect, useState } from "react";
import { apiService } from "../services/apiService";
import { UserProfile } from "../services/apiService";
import { Card, CardHeader, CardBody, Avatar } from "@nextui-org/react";

interface ProfilePageProps {
  isAuthenticated: boolean;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ isAuthenticated }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated) {
        const data = await apiService.me();
        setProfile(data);
      }
    };
    fetchProfile();
  }, [isAuthenticated]);

  if (!profile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1>Loading profile...</h1>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen p-4">
      <Card className="max-w-[500px] w-full p-6 shadow-2xl">
        <CardHeader className="flex gap-5">
          <Avatar
            name={profile.name}
            color="primary"
            className="w-20 h-20 text-3xl bg-gradient-to-tr from-pink-500 to-yellow-500"
          />
          <div className="flex flex-col justify-center">
            <h1>{profile.name}</h1>
            <h1 color="gray">{profile.email}</h1>
          </div>
        </CardHeader>
        <CardBody>
          <h1 className="mt-4">
            <strong>Member since:</strong>{" "}
            {new Date(profile.createdAt).toLocaleDateString()}
          </h1>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProfilePage;
