"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import InfiniteScroll from "react-infinite-scroll-component";
import PostTile from "~~/components/post_tile";
import AtProtoManager from "~~/lib/atproto_manager";

const Homepage = () => {
  const [feeds, setFeeds] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const API_URL = "https://woodtuft.us-west.host.bsky.network/xrpc/app.bsky.feed.getFeed";
  const FEED_PATH = encodeURIComponent(`at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.generator/whats-hot`);

  const fetchFeeds = async (nextCursor?: string) => {
    if (loading || (!hasMore && nextCursor)) return;

    const atProtoManager = new AtProtoManager();

    const extraData = await atProtoManager.getWallet(Cookies.get("did") ?? "");

    try {
      setLoading(true);

      const url = `${API_URL}?feed=${FEED_PATH}&limit=10${nextCursor ? `&cursor=${nextCursor}` : ""}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${Cookies.get("accessJwt")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      const { feed, cursor: newCursor } = data;
      console.log(feed[0]);

      setFeeds(prevFeeds => [...prevFeeds, ...feed]);
      setCursor(newCursor);
      setHasMore(Boolean(newCursor));
    } catch (error) {
      console.error("Error fetching feeds:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  return (
    <div className="homepage overflow-x-clip">
      <InfiniteScroll
        dataLength={feeds.length}
        next={() => fetchFeeds(cursor)}
        hasMore={hasMore}
        loader={<p className=""></p>}
        endMessage={<p className="text-center p-4">No more feeds to show</p>}
      >
        {feeds.map((feed, index) => (
          <PostTile key={index} post={feed.post} user={feed.post.author} />
        ))}
      </InfiniteScroll>
      {loading && !feeds.length && <p className="text-center p-4">Fetching feeds...</p>}
    </div>
  );
};

export default Homepage;
