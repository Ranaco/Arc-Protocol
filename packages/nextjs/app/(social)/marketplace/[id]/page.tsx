import * as React from "react";
import PostTile from "~~/components/post_tile";

export default async function Item({ params }: { params: Promise<{ id: any }> }) {
  const { id } = await params;

  return (
    <>
      <PostTile
        content="lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
        image={`https://picsum.photos/500/750/`}
        link="#"
        user="User Name"
        postedAt="Just Now"
        onMarketplace
      />
      <div className="w-full shadow-[0_0_0_1px_rgba(255,255,255,0.1)]" />
    </>
  );
}
