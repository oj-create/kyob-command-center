type FathomAssignee = { name?: string; email?: string | null; team?: string | null } | string;

type FathomActionItem = {
  description?: string; // Fathom v2
  text?: string;        // Fathom v1 / plain string fallback
  assignee?: FathomAssignee;
  completed?: boolean;
};

type FathomBody = {
  recording_id?: number | string;
  call_id?: string;
  meeting_id?: string;
  title?: string;
  meeting_title?: string;
  action_items?: FathomActionItem[];
};

export type ExtractedTask = {
  title: string;
  meetingId: string | undefined;
};

export function extractFathomTasks(
  payload: unknown,
  userNames: string[]
): ExtractedTask[] {
  // Unwrap N8N envelope: [{body: {...}}] or {body: {...}} or raw FathomBody
  let body: FathomBody;
  if (Array.isArray(payload) && payload.length > 0 && (payload[0] as Record<string, unknown>).body) {
    body = (payload[0] as { body: FathomBody }).body;
  } else if (payload !== null && typeof payload === "object" && "body" in (payload as object)) {
    body = (payload as { body: FathomBody }).body;
  } else {
    body = payload as FathomBody;
  }

  const items = body?.action_items ?? [];
  const meetingId = String(body?.recording_id ?? body?.call_id ?? body?.meeting_id ?? "") || undefined;
  const lowerNames = userNames.map((n) => n.toLowerCase());

  return items
    .filter((item) => {
      const taskText = (item.description ?? item.text ?? "").toLowerCase();
      const assigneeName = typeof item.assignee === "string"
        ? item.assignee
        : (item.assignee?.name ?? "");
      const assigneeEmail = typeof item.assignee === "string"
        ? ""
        : (item.assignee?.email ?? "");
      const assigneeLower = `${assigneeName} ${assigneeEmail}`.toLowerCase();

      return lowerNames.some(
        (name) => taskText.includes(name) || assigneeLower.includes(name)
      );
    })
    .map((item) => ({
      title: item.description ?? item.text ?? "",
      meetingId,
    }));
}

type SlackPayload = { text?: string; message?: string };

export function extractSlackTask(payload: SlackPayload): ExtractedTask | null {
  const text = (payload.text ?? payload.message ?? "").trim();
  if (!text) return null;
  return { title: text, meetingId: undefined };
}
