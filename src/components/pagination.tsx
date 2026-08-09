import { ChevronLeft, ChevronRight } from "lucide-react";
import { Btn } from "@/components/btn";
import { Dropdown } from "@/components/dropdown";

const DEFAULT_PER_PAGE_OPTIONS = [5, 10, 20, 50];

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
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i + 1)}
              className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${page === i + 1 ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"}`}
            >
              {i + 1}
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
