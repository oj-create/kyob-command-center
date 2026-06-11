"use client";

import { useEffect, useState } from "react";

type Post = {
  id: string;
  title: string;
  status: string;
  scheduledDate: string | null;
  platform: string;
};

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-yellow-500/20 text-yellow-300",
  scheduled: "bg-blue-500/20 text-blue-300",
  published: "bg-green-500/20 text-green-300",
};

export default function ContentPanel() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then(setPosts);
  }, []);

  const filtered =
    filter === "all" ? posts : posts.filter((p) => p.status === filter);

  return (
    <div className="rounded-xl bg-[#1e1e35] border border-white/10 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-purple-400 uppercase tracking-widest">Content</p>
        <div className="flex gap-1">
          {["all", "draft", "scheduled", "published"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`text-[10px] px-2 py-0.5 rounded capitalize transition-colors ${
                filter === s
                  ? "bg-purple-500/30 text-purple-300"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="text-white/30 text-sm">No posts in queue</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((post) => (
            <div key={post.id} className="flex items-center justify-between gap-3">
              <p className="text-sm text-white/80 truncate flex-1">{post.title}</p>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                  STATUS_BADGE[post.status] ?? STATUS_BADGE.draft
                }`}
              >
                {post.status}
              </span>
              {post.scheduledDate && (
                <span className="text-[10px] text-white/30 flex-shrink-0">
                  {new Date(post.scheduledDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
