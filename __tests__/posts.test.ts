import { parseQueueFile } from "@/lib/posts";

describe("parseQueueFile", () => {
  it("parses valid posts array", () => {
    const raw = JSON.stringify([
      {
        id: "abc",
        title: "Why async beats sync",
        content: "Full post...",
        platform: "linkedin",
        status: "scheduled",
        scheduledDate: "2026-06-17",
        createdAt: "2026-06-11T10:00:00Z",
      },
    ]);

    const posts = parseQueueFile(raw);
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toBe("Why async beats sync");
    expect(posts[0].status).toBe("scheduled");
  });

  it("returns empty array for invalid JSON", () => {
    const posts = parseQueueFile("not json");
    expect(posts).toEqual([]);
  });

  it("returns empty array for empty array", () => {
    const posts = parseQueueFile("[]");
    expect(posts).toEqual([]);
  });
});
