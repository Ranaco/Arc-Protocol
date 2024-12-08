import React from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import PostTile from "~~/components/post_tile";

const fetchProfileByUsername = async (username: string) => {
  const API_URL = `https://woodtuft.us-west.host.bsky.network/xrpc/app.bsky.actor.getProfile`;
  const response = await fetch(`${API_URL}?actor=${username}`, { cache: "no-store" });

  if (!response.ok) {
    return null;
  }

  return response.json();
};

const fetchPostsByUsername = async (username: string) => {
  const API_URL = `https://woodtuft.us-west.host.bsky.network/xrpc/app.bsky.feed.getAuthorFeed`;
  const response = await fetch(`${API_URL}?actor=at://${username}&limit=50`, { cache: "no-store" });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return data.feed || [];
};

interface ProfilePageProps {
  params: {
    username: string;
  };
}

const ProfilePage = async ({ params }: ProfilePageProps) => {
  const { username } = params;

  if (!username) {
    notFound();
  }

  try {
    const [profile, posts] = await Promise.all([fetchProfileByUsername(username), fetchPostsByUsername(username)]);

    if (!profile) {
      notFound();
    }

    return (
      <div className="w-full flex flex-col items-center justify-start min-h-screen overflow-x-clip">
        {/* Profile Header */}
        <div className="flex flex-col items-center justify-start w-full h-auto shadow-[0_0_0_1px_rgba(255,255,255,0.1)]">
          <div className="relative flex flex-col items-center justify-start w-full h-[180px] bg-gray-700">
            <Image
              src={profile.banner || "https://picsum.photos/500/750/"}
              alt="profile banner"
              width={500}
              height={750}
              className="w-full h-full z-0"
              style={{ objectFit: "cover" }}
            />
            <div className="absolute bottom-[-35%] left-[5px] w-full flex flex-row items-end px-4">
              <div className="bg-gray-400 rounded-full size-28 z-10 overflow-clip shadow-[0_0_0_1px_rgba(255,255,255,0.1)]">
                <Image
                  src={profile.avatar || "https://picsum.photos/100/100/"}
                  alt="profile avatar"
                  width={100}
                  height={100}
                  className="w-full h-full z-0"
                  style={{ objectFit: "cover" }}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start justify-start w-full h-auto mt-12 p-6 gap-1">
            <span className="dark:text-white text-2xl font-bold text-black">{profile.displayName}</span>
            <span className="dark:text-gray-400 text-lg text-gray-700">@{profile.handle}</span>
            <div className="flex flex-row gap-4 items-center mt-2">
              <span className="text-gray-400 text-md">
                <span className="font-bold dark:text-white text-black">{profile.followersCount || 0}</span>
                &nbsp;followers
              </span>
              <span className="text-gray-400 text-md">
                <span className="font-bold dark:text-white text-black">{profile.followsCount || 0}</span>
                &nbsp;following
              </span>
              <span className="text-gray-400 text-md">
                <span className="font-bold dark:text-white text-black">{posts.length}</span> posts
              </span>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="w-full max-w-3xl">
          {posts.length > 0 ? (
            posts.map((post, index) => <PostTile key={index} post={post.post} user={post.post.author} />)
          ) : (
            <p className="text-center text-gray-500">No posts to display</p>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering profile:", error);
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-center text-gray-500">Failed to load profile. Please try again later.</p>
      </div>
    );
  }
};

export default ProfilePage;
