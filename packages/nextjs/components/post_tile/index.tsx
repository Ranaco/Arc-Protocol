"use client";

import * as React from "react";
import Image from "next/image";
import { Currency, Heart, MessageSquare, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import externalContracts from "~~/contracts/externalContracts";
import AtProtoManager from "~~/lib/atproto_manager";

interface PostTileProps {
  post: Record<string, any>;
  user: Record<string, any>;
  withdraw: boolean;
}

const fetchNetWorth = async (post: any) => {
  const res = await fetch("/api/wallet/curve", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      method: "getUserProfitOrLossForPost",
      get: true,
      args: { postId: post?.uri },
    }),
  });
  const data = await res.json();
  console.log("this is networth", data);
};

const PostTile: React.FC<PostTileProps> = ({ post, user, withdraw }) => {
  const aspectRatio = post?.record?.embed?.images?.[0]?.aspectRatio;
  const [liked, setLiked] = React.useState(post?.viewer?.like);
  const [likeCount, setLikeCount] = React.useState(post?.likeCount || 0);
  const [showWithdrawPopup, setShowWithdrawPopup] = React.useState(false);
  const [withdrawAmount, setWithdrawAmount] = React.useState("");
  fetchNetWorth(post);

  const dynamicAspectRatioStyle = aspectRatio
    ? { paddingBottom: `${(aspectRatio.height / aspectRatio.width) * 100}%` }
    : {};

  const getElapsedDuration = (timestamp: string) => {
    const now: any = new Date();
    const past: any = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }
  };

  const handleInvestClick = async () => {
    try {
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

      console.log("investing in post", post);
      const uri = post?.uri;
      const res = await fetch("/api/wallet/curve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "investInPost",
          args: {
            postId: uri,
            tokensToBuy: "10",
          },
        }),
      });
      if (!res.ok) {
        toast.error("Failed to invest");
        throw new Error("Failed to invest");
      }
      toast.success("Investment successful!");
    } catch (error) {
      console.error("Error handling invest:", error);
    }
  };

  const handleWithdrawClick = () => {
    setShowWithdrawPopup(true);
  };

  const handleWithdrawSubmit = async () => {
    try {
      const uri = post?.uri;
      const res = await fetch("/api/wallet/curve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          method: "withdrawFromPost",
          args: {
            postId: uri,
            tokensToSell: withdrawAmount,
          },
        }),
      });

      await fetch("/api/attest/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profitMade: withdrawAmount,
        }),
      });

      if (!res.ok) {
        toast.error("Failed to withdraw");
        throw new Error("Failed to withdraw");
      }

      toast.success("Withdrawal successful!");
      setShowWithdrawPopup(false);
      setWithdrawAmount("");
    } catch (error) {
      console.error("Error handling withdrawal:", error);
    }
  };

  const handleLikeClick = async () => {
    try {
      const atProtoManager = new AtProtoManager();
      if (liked && post?.viewer?.like) {
        await atProtoManager.deleteRecord("app.bsky.feed.like", post?.viewer.like);
        setLiked(false);
        setLikeCount((prev: any) => Math.max(prev - 1, 0));
      } else {
        const record = {
          subject: {
            uri: post?.uri,
            cid: post?.cid,
          },
          createdAt: new Date().toISOString(),
        };
        await atProtoManager.createRecord("app.bsky.feed.like", record);
        setLiked(true);
        setLikeCount((prev: any) => prev + 1);
      }
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  console.log("This is the investment post", post?.value?.text);

  return (
    <div className="w-full flex flex-row gap-4 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.1)] relative">
      {/* Withdraw Popup */}
      {showWithdrawPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col w-80">
            <h2 className="text-xl mb-4">Withdraw Funds</h2>
            <input
              type="text"
              value={withdrawAmount}
              onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="Enter amount to withdraw"
              className="p-2 border border-gray-300 dark:border-gray-600 rounded mb-4 dark:bg-gray-700 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowWithdrawPopup(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded hover:bg-gray-400 dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 overflow-clip">
        <Image
          src={user.avatar}
          alt={user.displayName}
          width={100}
          height={100}
          className="w-full h-full z-0"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="flex flex-col justify-start items-start gap-1 flex-1">
        <div className="flex flex-row gap-2 items-center">
          <span className="font-medium text-sm text-black dark:text-white text-nowrap">{user.displayName}</span>
          <span className="text-gray-400 text-sm">@{user.handle}</span>
          <span>·&nbsp;&nbsp;{getElapsedDuration(post?.record?.createdAt)}</span>
        </div>
        <span>{!post?.record?.text ? post?.value?.text : post?.record.text}</span>
        {post?.record?.embed?.images && (
          <div
            className="relative w-full rounded-lg overflow-hidden mt-4"
            style={{ ...dynamicAspectRatioStyle, position: "relative" }}
          >
            <Image
              src={post?.embed?.images[0].fullsize}
              alt={post?.embed?.images[0].alt || "Post Image"}
              fill
              className="absolute inset-0 object-cover"
            />
          </div>
        )}
        {/* Interaction Buttons */}
        <div className="flex flex-row justify-between px-3 items-center w-full mt-5">
          {!withdraw && (
            <div className="flex flex-row justify-between px-3 items-center w-full mt-5">
              <button
                onClick={handleLikeClick}
                className="text-red-500 hover:text-red-600 focus:outline-none flex flex-row gap-0 items-center bg-base-300 px-3 py-1.5 rounded-md"
              >
                <Heart className={`w-5 h-5 ${liked ? "fill-red-500" : ""}`} size="24" />
                &nbsp;&nbsp;{likeCount > 1000 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
              </button>
              <button className="text-gray-500 hover:text-gray-600 focus:outline-none flex flex-row gap-0 items-center bg-base-300 px-3 py-1.5 rounded-md">
                <MessageSquare className="w-5 h-5" size="24" />
                &nbsp;&nbsp;{post?.replyCount > 1000 ? `${(post?.replyCount / 1000).toFixed(1)}k` : post.replyCount}
              </button>
              <button className="text-gray-500 hover:text-gray-600 focus:outline-none flex flex-row gap-0 items-center bg-base-300 px-3 py-1.5 rounded-md">
                <RefreshCw className="w-5 h-5" size="24" />
                &nbsp;&nbsp;{post?.repostCount > 1000 ? `${(post?.repostCount / 1000).toFixed(1)}k` : post.repostCount}
              </button>
              <button
                onClick={handleInvestClick}
                className="text-gray-500 hover:text-gray-600 focus:outline-none flex flex-row gap-0 items-center bg-base-300 px-3 py-1.5 rounded-md"
              >
                <Currency className="w-5 h-5" size="24" />
                &nbsp;&nbsp;{post?.repostCount > 1000 ? `${(post?.repostCount / 1000).toFixed(1)}k` : post.repostCount}
              </button>
            </div>
          )}
          {/* Withdraw Button */}
          {withdraw && (
            <button
              onClick={handleWithdrawClick}
              className="text-gray-500 hover:text-gray-600 focus:outline-none flex flex-row gap-0 items-center bg-base-300 px-3 py-1.5 rounded-md"
            >
              Withdraw
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostTile;
