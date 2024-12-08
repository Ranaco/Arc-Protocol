"use client";

import * as React from "react";
import Cookies from "js-cookie";
import PostTile from "~~/components/post_tile";

const Posts = ({ posts }: { posts: any[] }) => {
  const accessJwt = Cookies.get("accessJwt");
  const actor = Cookies.get("did");

  if (!accessJwt || !actor) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-center text-gray-500">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <>
      {posts.length > 0 ? (
        posts.map((post, index) => <PostTile key={index} post={post.post} user={post.post.author} />)
      ) : (
        <p className="text-center text-gray-500">No posts to display</p>
      )}
    </>
  );
};

export default Posts;
