"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Portfolio from "./_components/portfolio";
import Posts from "./_components/posts";
import Cookies from "js-cookie";

const fetchProfile = async (actor: string, accessJwt: string) => {
  const API_URL = `https://woodtuft.us-west.host.bsky.network/xrpc/app.bsky.actor.getProfile`;
  const response = await fetch(`${API_URL}?actor=${actor}`, {
    headers: {
      Authorization: `Bearer ${accessJwt}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  return response.json();
};

const fetchPosts = async (actor: string, accessJwt: string) => {
  const API_URL = `https://woodtuft.us-west.host.bsky.network/xrpc/app.bsky.feed.getAuthorFeed`;
  const response = await fetch(`${API_URL}?actor=${actor}&limit=50`, {
    headers: {
      Authorization: `Bearer ${accessJwt}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch posts");
  }

  const data = await response.json();
  return data.feed || [];
};

const fetchInvestments = async () => {
  const response = await fetch("/api/wallet/curve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "getUserInvestedPosts",
      get: true,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch investments");
  }

  const data = await response.json();
  return data.res || [];
};

const ProfilePage = () => {
  const accessJwt = Cookies.get("accessJwt");
  const actor = Cookies.get("did");

  const [profile, setProfile] = useState<any>({});
  const [posts, setPosts] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);

  useEffect(() => {
    if (accessJwt && actor) {
      fetchProfile(actor, accessJwt)
        .then(profileData => {
          setProfile(profileData);
          console.log("profile", profileData);
        })
        .catch(err => console.error(err));

      fetchPosts(actor, accessJwt)
        .then(postsData => {
          setPosts(postsData);
          console.log("posts", postsData);
        })
        .catch(err => console.error(err));

      fetchInvestments()
        .then(investData => {
          setInvestments(investData);
          console.log("investments", investData);
        })
        .catch(err => console.error(err));
    }
  }, [accessJwt, actor]);

  if (!accessJwt || !actor) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-center text-gray-500">Please log in to view your profile.</p>
      </div>
    );
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
            <div className="flex flex-row gap-2 items-start mt-auto ml-auto px-4">
              <button className="hover:text-gray-500 text-white focus:outline-none bg-base-300 p-3 rounded-2xl">
                Edit Profile
              </button>
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

      {/* Tab System */}
      <div className="w-full max-w-3xl mt-6">
        <TabSystem posts={posts} investments={investments} />
      </div>
    </div>
  );
};

const TabSystem = ({ posts, investments }: { posts: any[]; investments: any[] }) => {
  const [activeTab, setActiveTab] = useState("posts");

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex justify-around w-full">
        <button
          className={`px-4 py-2 ${activeTab === "posts" ? "border-b-4 border-blue-500 text-blue-500" : "text-gray-500"}`}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button
          className={`px-4 py-2 ${activeTab === "portfolio" ? "border-b-4 border-blue-500 text-blue-500" : "text-gray-500"}`}
          onClick={() => setActiveTab("portfolio")}
        >
          Portfolio
        </button>
      </div>

      <div className="w-full transition-all duration-300 ease-in-out mt-4">
        {activeTab === "posts" && <Posts posts={posts} />}
        {activeTab === "portfolio" && <Portfolio inv={investments} />}
      </div>
    </div>
  );
};

export default ProfilePage;
