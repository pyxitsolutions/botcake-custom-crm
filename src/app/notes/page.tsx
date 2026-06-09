import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { getAllNotes } from "@/lib/actions";
import { formatDate } from "@/lib/utils";

export default async function NotesPage() {
  const notes = await getAllNotes();

  return (
    <>
      <Header
        title="Notes"
        description="All notes across leads"
      />
      <div className="space-y-4 p-4 sm:p-8">
        {notes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No notes yet. Notes added on lead detail pages will appear here.
            </CardContent>
          </Card>
        ) : (
          notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-6">
                <p className="leading-relaxed">{note.note}</p>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{formatDate(note.created_at)}</span>
                  {note.lead && (
                    <>
                      <span>·</span>
                      <Link
                        href={`/leads/${note.lead_id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {note.lead.customer?.name ?? "Unknown"} — {note.lead.project_goal}
                      </Link>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
