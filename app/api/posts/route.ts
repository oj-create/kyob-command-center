import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readQueueFile } from "@/lib/posts";

export async function GET() {
  try {
    const queuePosts = readQueueFile();

    if (queuePosts.length > 0) {
      await Promise.all(
        queuePosts
          .filter((p) => !!p.id)
          .map((p) =>
            db.post.upsert({
              where: { externalId: p.id },
              create: {
                externalId: p.id,
                title: p.title,
                content: p.content,
                platform: p.platform,
                status: p.status,
                scheduledDate: p.scheduledDate ? new Date(p.scheduledDate) : null,
                notes: p.notes,
              },
              update: {
                title: p.title,
                status: p.status,
                scheduledDate: p.scheduledDate ? new Date(p.scheduledDate) : null,
              },
            })
          )
      );
    }

    const posts = await db.post.findMany({
      orderBy: { scheduledDate: "asc" },
    });

    return NextResponse.json(posts);
  } catch (err) {
    console.error("Posts DB error:", err);
    return NextResponse.json(
      { error: "Database unavailable", posts: [] },
      { status: 503 }
    );
  }
}
