import { ChevronLeft, ChevronRight } from "lucide-react";
import { Btn } from "@/components/btn";

export const Pagination = ({
  page, pages, total, perPage, onPageChange, itemLabel = "item",
}: {
  page: number;
  pages: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
}) => {
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <p className="text-xs text-muted-foreground">
        Showing {from}–{to} of {total} {itemLabel}{total !== 1 ? "s" : ""}
      </p>
      <div className="flex gap-1">
        <Btn variant="secondary" size="xs" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}>
          <ChevronLeft size={12} />
        </Btn>
        {Array.from({ length: pages }, (_, i) => (
          <button
            key={i}
            onClick={() => onPageChange(i + 1)}
            className={`w-7 h-7 rounded text-xs font-medium transition-colors ${page === i + 1 ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
          >
            {i + 1}
          </button>
        ))}
        <Btn variant="secondary" size="xs" onClick={() => onPageChange(Math.min(pages, page + 1))} disabled={page === pages}>
          <ChevronRight size={12} />
        </Btn>
      </div>
    </div>
  );
};
