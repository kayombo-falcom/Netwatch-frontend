import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Btn } from "@/components/btn";
import { Dropdown } from "@/components/dropdown";

const DEFAULT_PER_PAGE_OPTIONS = [5, 10, 20, 50];

const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, i) => start + i);

/** Static pagination: first few pages, then an ellipsis straight to the last page — e.g. 1 2 3 … 100. */
const getPageItems = (total: number, leadingCount = 3): (number | "ellipsis")[] => {
  if (total <= leadingCount + 1) return range(1, total);
  return [...range(1, leadingCount), "ellipsis", total];
};

export const Pagination = ({
  page, pages, total, perPage, onPageChange, onPerPageChange, perPageOptions = DEFAULT_PER_PAGE_OPTIONS, itemLabel = "item",
}: {
  page: number;
  pages: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  itemLabel?: string;
}) => {
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border">
      <p className="text-xs text-muted-foreground">
        Showing {from}–{to} of {total} {itemLabel}{total !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-4">
        {onPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page</span>
            <div className="w-18">
              <Dropdown
                value={String(perPage)}
                onChange={v => onPerPageChange(Number(v))}
                options={perPageOptions.map(n => ({ label: String(n), value: String(n) }))}
              />
            </div>
          </div>
        )}
        <div className="flex gap-1">
          <Btn variant="secondary" size="xs" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}>
            <ChevronLeft size={12} />
          </Btn>
          {getPageItems(pages).map((item, i) => item === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-muted-foreground/60">
              <MoreHorizontal size={14} />
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${page === item ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
            >
              {item}
            </button>
          ))}
          <Btn variant="secondary" size="xs" onClick={() => onPageChange(Math.min(pages, page + 1))} disabled={page === pages}>
            <ChevronRight size={12} />
          </Btn>
        </div>
      </div>
    </div>
  );
};
