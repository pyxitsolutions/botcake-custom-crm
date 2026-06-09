import { formatDate } from "@/lib/utils";
import type { Note } from "@/types";

interface NotesListProps {
  notes: Note[];
}

export function NotesList({ notes }: NotesListProps) {
  if (notes.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        No notes yet. Add the first note above.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <div
          key={note.id}
          className="rounded-lg border bg-muted/30 p-4"
        >
          <p className="text-sm leading-relaxed">{note.note}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {formatDate(note.created_at)}
          </p>
        </div>
      ))}
    </div>
  );
}
