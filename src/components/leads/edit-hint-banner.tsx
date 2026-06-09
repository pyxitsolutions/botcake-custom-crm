import { Pencil } from "lucide-react";

export function EditHintBanner() {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
      <Pencil className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        <strong>How to edit:</strong> Click the <strong>Status</strong> dropdown
        on any row to update it. Open a lead to view project details and add notes.
      </p>
    </div>
  );
}
