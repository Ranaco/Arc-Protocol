import React, { useRef, useState } from "react";
import { Image, Video } from "lucide-react";

interface CreateTileProps {
  onPost: (content: string) => void;
}

const CreateTile: React.FC<CreateTileProps> = ({ onPost }) => {
  const [content, setContent] = useState("");
  const spanRef = useRef<HTMLSpanElement>(null);

  const handlePost = () => {
    if (content.trim()) {
      onPost(content);
      setContent("");
      if (spanRef.current) {
        spanRef.current.textContent = "";
      }
    }
  };

  return (
    <div className="sticky top-0 p-4 flex flex-col gap-3 w-full">
      <div className="flex items-start gap-3">
        {/* Profile Picture */}
        <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600"></div>

        <div className="flex flex-col gap-4 w-full">
          {/* Editable Span */}
          <span
            ref={spanRef}
            contentEditable
            onInput={e => setContent(e.currentTarget.textContent || "")}
            className="flex-1 bg-transparent resize-none focus:outline-none focus:ring-2 rounded-md text-sm p-2 min-h-[50px] border border-gray-300 dark:border-gray-600 overflow-hidden"
            role="textbox"
            aria-placeholder="What's happening?"
          ></span>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            {/* Media and Options */}
            <div className="flex items-center gap-3">
              <button className="text-blue-500 hover:text-blue-600 focus:outline-none" title="Add Image">
                <Image className="w-5 h-5" size="24" />
              </button>
              <button className="text-blue-500 hover:text-blue-600 focus:outline-none" title="Add Video">
                <Video className="w-5 h-5" size="24" />
              </button>
            </div>

            {/* Post Button */}
            <button
              onClick={handlePost}
              disabled={!content.trim()}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                content.trim()
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

export default CreateTile;
