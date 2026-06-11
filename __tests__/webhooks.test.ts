import { extractFathomTasks, extractSlackTask } from "@/lib/webhooks";

describe("extractFathomTasks", () => {
  it("returns action items that mention the user by name", () => {
    const payload = {
      meeting_title: "Weekly sync",
      call_id: "abc123",
      action_items: [
        { text: "OJ to follow up with partner", assignee: "OJ" },
        { text: "Team to review roadmap", assignee: "team" },
        { text: "Evan to send proposal", assignee: "Evan" },
      ],
    };

    const tasks = extractFathomTasks(payload, ["OJ", "Evan"]);
    expect(tasks).toHaveLength(2);
    expect(tasks[0].title).toBe("OJ to follow up with partner");
    expect(tasks[0].meetingId).toBe("abc123");
  });

  it("returns empty array when no matching action items", () => {
    const payload = {
      call_id: "xyz",
      action_items: [
        { text: "Team to review roadmap", assignee: "team" },
      ],
    };

    const tasks = extractFathomTasks(payload, ["OJ", "Evan"]);
    expect(tasks).toHaveLength(0);
  });

  it("handles plain string action items (no assignee field)", () => {
    const payload = {
      call_id: "xyz",
      action_items: ["OJ to send the brief", "Review docs"],
    };

    const tasks = extractFathomTasks(payload, ["OJ", "Evan"]);
    expect(tasks).toHaveLength(1);
    expect(tasks[0].title).toBe("OJ to send the brief");
  });
});

describe("extractSlackTask", () => {
  it("extracts title from slack payload", () => {
    const payload = { text: "Follow up with James about partnership" };
    const task = extractSlackTask(payload);
    expect(task?.title).toBe("Follow up with James about partnership");
  });

  it("returns null for empty text", () => {
    const task = extractSlackTask({ text: "  " });
    expect(task).toBeNull();
  });
});
