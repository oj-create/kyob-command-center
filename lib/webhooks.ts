type FathomActionItem = { text: string; assignee?: string } | string;

type FathomPayload = {
  call_id?: string;
  meeting_id?: string;
  meeting_title?: string;
  action_items?: FathomActionItem[];
};

export type ExtractedTask = {
  title: string;
  meetingId: string | undefined;
};

export function extractFathomTasks(
  payload: FathomPayload,
  userNames: string[]
): ExtractedTask[] {
  const items = payload.action_items ?? [];
  const meetingId = payload.call_id ?? payload.meeting_id;
  const lowerNames = userNames.map((n) => n.toLowerCase());

  return items
    .filter((item) => {
      const text = typeof item === "string" ? item : item.text;
      const assignee = typeof item === "string" ? "" : (item.assignee ?? "");
      return lowerNames.some(
        (name) =>
          text.toLowerCase().includes(name) ||
          assignee.toLowerCase().includes(name)
      );
    })
    .map((item) => ({
      title: typeof item === "string" ? item : item.text,
      meetingId,
    }));
}

type SlackPayload = { text?: string; message?: string };

export function extractSlackTask(payload: SlackPayload): ExtractedTask | null {
  const text = (payload.text ?? payload.message ?? "").trim();
  if (!text) return null;
  return { title: text, meetingId: undefined };
}
