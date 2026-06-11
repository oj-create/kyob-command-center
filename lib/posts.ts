import fs from "fs";
import path from "path";

export type QueuePost = {
  id: string;
  title: string;
  content: string;
  platform: string;
  status: "draft" | "scheduled" | "published";
  scheduledDate?: string;
  notes?: string;
  createdAt: string;
};

export function parseQueueFile(raw: string): QueuePost[] {
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as QueuePost[];
  } catch {
    return [];
  }
}

export function readQueueFile(): QueuePost[] {
  const filePath = path.join(process.cwd(), "posts", "queue.json");
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  return parseQueueFile(raw);
}
