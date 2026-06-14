"use client";

import { useEffect, useState } from "react";
import { PenLine } from "lucide-react";

type Post = {
  id: string;
  title: string;
  status: string;
  scheduledDate: string | null;
  platform: string;
};

const TABS = ["All", "Draft", "Scheduled", "Published"];

export default function ContentPanel() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setPosts(data); })
      .catch(() => {});
  }, []);

  const filtered =
    filter === "All" ? posts : posts.filter((p) => p.status === filter.toLowerCase());

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="sec-ico"><PenLine /></span>
        <span className="panel-title">Content</span>
        <div className="filters">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`filter${filter === tab ? " on" : ""}`}
              onClick={() => setFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="panel-scroll">
        {filtered.length === 0 ? (
          <div className="panel-empty">No {filter.toLowerCase()} posts</div>
        ) : (
          filtered.map((post) => (
            <div key={post.id} className="post">
              <span className={`post-stat ${post.status}`} />
              <div className="post-body">
                <div className="post-title">{post.title}</div>
                <div className="post-sub">
                  <span className={`post-badge ${post.status}`}>{post.status}</span>
                  {post.scheduledDate && (
                    <span className="post-date">
                      {new Date(post.scheduledDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
