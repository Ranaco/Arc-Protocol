"use client";

import * as React from "react";
import Cookies from "js-cookie";
import PostTile from "~~/components/post_tile";
import AtProtoManager from "~~/lib/atproto_manager";

const handleProfitOrLoss = async (post: any) => {
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

  const val = await res.json();

  return Number(val);
};

const fetchInvestments = async (atList: any[]) => {
  console.log("HElor lit", atList);
  const atPro = new AtProtoManager();
  const investments: any[] = [];
  for (let i = 0; i < atList.length; i++) {
    const response = await atPro.getPost(atList[i]);
    investments.push(response);
  }

  return investments;
};
const Portfolio = ({ inv, profile }: { inv: any[]; profile: any }) => {
  const accessJwt = Cookies.get("accessJwt");
  const actor = Cookies.get("did");
  const [investments, setInvestments] = React.useState<any[]>([]);

  React.useEffect(() => {
    (async () => {
      const invest = await fetchInvestments(inv);
      setInvestments(invest);
    })();
  }, []);

  if (!accessJwt || !actor) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <p className="text-center text-gray-500">Please log in to view your portfolio.</p>
      </div>
    );
  }

  console.log("final investments", investments);

  return (
    <>
      {investments.length > 0 ? (
        investments.map((inv, index) => <PostTile key={index} post={inv} user={profile} withdraw />)
      ) : (
        <p className="text-center text-gray-500">No investments to display</p>
      )}
    </>
  );
};

export default Portfolio;
