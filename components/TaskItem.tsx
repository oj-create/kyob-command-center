"use client";

type Task = {
  id: string;
  title: string;
  source: string;
  area: string;
  status: string;
};

const SOURCE_BADGE: Record<string, string> = {
  fathom: "bg-blue-500/20 text-blue-300",
  slack: "bg-green-500/20 text-green-300",
  manual: "bg-white/10 text-white/50",
};

type Props = {
  task: Task;
  onComplete: (id: string) => void;
};

export default function TaskItem({ task, onComplete }: Props) {
  return (
    <div className="flex items-start gap-2 group">
      <button
        onClick={() => onComplete(task.id)}
        className="mt-0.5 w-4 h-4 rounded border border-white/20 flex-shrink-0 hover:border-purple-400 transition-colors"
        aria-label="Complete task"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 leading-snug truncate">{task.title}</p>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded ${SOURCE_BADGE[task.source] ?? SOURCE_BADGE.manual}`}
        >
          {task.source}
        </span>
      </div>
    </div>
  );
}
