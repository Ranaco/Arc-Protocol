"use client";

import React, { useRef, useState } from "react";
import "./index.css";
import { Image as LImage, Video } from "lucide-react";
import toast from "react-hot-toast";
import externalContracts from "~~/contracts/externalContracts";
import AtProtoManager from "~~/lib/atproto_manager";

interface CreateProps {
  onPost: (post: Record<string, any>) => void;
}

const Create: React.FC<CreateProps> = () => {
  const spanRef = useRef<HTMLSpanElement>(null);

  const [post, setPost] = useState({
    image: "",
    content: "",
    enableInvestment: false,
    basePrice: 0,
    attestationLink: "https://google.com/",
  });

  const handleContractCall = async () => {
    await fetch("/api/wallet/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        method: "name",
        args: [],
      }),
    });
  };

  const handlePost = async () => {
    if (post.content.trim()) {
      try {
        const atProtoManager = new AtProtoManager();

        const record = {
          $type: "app.bsky.feed.post",
          text: post.content,
          createdAt: new Date().toISOString(),
          enableInvestment: post.enableInvestment,
          basePrice: post.basePrice,
          attestationLink: post.attestationLink,
        };

        const response = await atProtoManager.createRecord("app.bsky.feed.post", record);
        console.log("Post created successfully:", response);
        toast.success("Post created successfully!");

        await fetch("/api/wallet/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            method: "approve",
            args: {
              spender: externalContracts[1].ARCBoundingCurveMarketplace.address,
              value: "100000",
            },
          }),
        });
        const res = await fetch("/api/wallet/curve", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            method: "createPost",
            args: {
              postId: response.uri,
              a: "1",
              b: "1",
            },
          }),
        });

        if (!res.ok) {
          toast.error("Failed to create post");
          throw new Error("Failed to create post");
        }

        setPost({
          image: "",
          content: "",
          enableInvestment: false,
          basePrice: 0,
          attestationLink: "",
        });
        if (spanRef.current) {
          spanRef.current.textContent = "";
        }
      } catch (error) {
        console.error("Error creating post:", error);
      }
    }
  };

  const handleInput = (id: string, value: string | boolean | number) => setPost(prev => ({ ...prev, [id]: value }));

  return (
    <div className="flex flex-col gap-3 w-full rounded-md shadow-lg">
      <div className="flex items-start gap-3 rounded-md shadow-lg p-4">
        <div className="flex flex-col gap-4 w-full">
          <span
            ref={spanRef}
            contentEditable
            onInput={e => handleInput("content", e.currentTarget.textContent || "")}
            className="flex-1 bg-transparent resize-none focus:outline-none rounded-md text-sm p-2 overflow-hidden text-[1.3rem] min-h-[250px] placeholder-visible placeholder-gray-400"
            role="textbox"
            aria-placeholder="What's happening?"
            data-placeholder="What's happening?"
          />

          {/* NFT Options */}
          <div className="flex flex-row gap-2 justify-between items-center">
            <div className="flex items-center gap-4">
              <input
                id="nft"
                type="checkbox"
                checked={post.enableInvestment}
                onChange={e => handleInput("enableInvestment", e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="nft" className="text-gray-500 dark:text-gray-400 font-bold text-lg">
                Enable Investment
              </label>
            </div>
            <div className="flex items-center gap-4">
              <input
                id="basePrice"
                type="number"
                value={post.basePrice}
                onChange={e => handleInput("basePrice", parseFloat(e.target.value))}
                className="rounded-md w-[100px] border-gray-300 focus:outline-none text-sm p-2"
              />
              <label htmlFor="basePrice" className="text-gray-500 dark:text-gray-400 font-bold text-lg">
                Base Price
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-4">
            {/* Media and Options */}
            <div className="flex items-center gap-3">
              <button onClick={handleContractCall} className="text-blue-500 hover:text-blue-600 focus:outline-none">
                <LImage className="w-5 h-5" size="24" />
              </button>
              <button className="text-blue-500 hover:text-blue-600 focus:outline-none" title="Add Video">
                <Video className="w-5 h-5" size="24" />
              </button>
            </div>

            {/* Post Button */}
            <button
              onClick={handlePost}
              disabled={!post.content.trim()}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                post.content.trim()
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
              }`}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
