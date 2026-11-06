"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";

export interface DataTableColumn<T> {
  key: keyof T | string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (value: unknown, row: T, index: number) => ReactNode;
}

export interface DataTableActions<T> {
  view?: (row: T) => void;
  edit?: (row: T) => void;
  delete?: (row: T) => void;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string | number;

  title: string;
  description?: string;

  searchPlaceholder?: string;

  searchKeys?: (keyof T)[];

  actions?: DataTableActions<T>;

  onAdd?: () => void;
  onRefresh?: () => void;

  addButtonText?: string;

  loading?: boolean;

  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;

  onPageChange?: (page: number) => void;
  onSizeChange?: (size: number) => void;
  onSearch?: (search: string) => void;
  onSort?: (key: string, direction: "asc" | "desc" | null) => void;

  currentSearch?: string;
  currentSort?: string;

  pageSizeOptions?: number[];

  emptyMessage?: string;
}

export default function DataTable<T>({
  data,
  columns,
  getRowId,

  title,
  description,

  searchPlaceholder = "Cari data...",

  actions,

  onAdd,
  onRefresh,

  addButtonText = "Tambah",

  loading = false,

  page = 0,
  size = 10,
  totalElements = 0,
  totalPages = 0,

  onPageChange,
  onSizeChange,
  onSearch,
  onSort,

  currentSearch = "",
  currentSort = "",

  pageSizeOptions = [10, 20, 50, 100],

  emptyMessage = "Belum ada data.",
}: DataTableProps<T>) {
  const [search, setSearch] = useState(currentSearch);

  useEffect(() => {
    setSearch(currentSearch);
  }, [currentSearch]);

  const paginationItems = useMemo(() => {
    const items: (number | "...")[] = [];

    if (totalPages <= 1) {
      return [0];
    }

    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) {
        items.push(i);
      }

      return items;
    }

    items.push(0);

    if (page > 2) {
      items.push("...");
    }

    const start = Math.max(1, page - 1);

    const end = Math.min(totalPages - 2, page + 1);

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (page < totalPages - 3) {
      items.push("...");
    }

    items.push(totalPages - 1);

    return items;
  }, [page, totalPages]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onSearch?.(value);
  };

  const handleSort = (key: string, sortable?: boolean) => {
    if (!sortable) {
      return;
    }

    let direction: "asc" | "desc" | null = "asc";

    if (currentSort === `${key},asc`) {
      direction = "desc";
    } else if (currentSort === `${key},desc`) {
      direction = null;
    }

    onSort?.(key, direction);
  };

  const startRecord = totalElements > 0 ? page * size + 1 : 0;

  const endRecord = Math.min((page + 1) * size, totalElements);

  const columnCount = columns.length + 1 + (actions ? 1 : 0);

  return (
    <div className="w-full">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <h5 className="text-3xl font-bold tracking-[-0.035em]">
            {title}
          </h5>

          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 ">
              {description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="
                inline-flex
                cursor-pointer
                h-10
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                text-xs
                font-semibold
                text-slate-600
                shadow-sm
                transition-all
                hover:border-slate-300
                hover:bg-slate-50
                disabled:pointer-events-none
                disabled:opacity-50
              "
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 5v4h4" />
                <path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 19v-4h-4" />
              </svg>
              Refresh
            </button>
          )}

          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="
                inline-flex
                h-10
                items-center
                cursor-pointer
                gap-2
                rounded-xl
                bg-[#1358A8]
                px-4
                text-xs
                font-semibold
                text-white
                shadow-[0_8px_20px_rgba(19,88,168,0.20)]
                transition-all
                hover:-translate-y-0.5
                hover:bg-[#0D3B73]
              "
            >
              <Plus size={16} />
              {addButtonText}
            </button>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-4 border-b border-slate-100 bg-white px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Tampilkan</span>

            <div className="relative">
              <select
                value={size}
                onChange={(event) => onSizeChange?.(Number(event.target.value))}
                className="
                  h-9
                  appearance-none
                  rounded-lg
                  border
                  border-slate-200
                  bg-white
                  pl-3
                  pr-8
                  text-xs
                  font-semibold
                  text-slate-700
                  outline-none
                  transition
                  hover:border-slate-300
                  focus:border-blue-400
                  focus:ring-4
                  focus:ring-blue-50
                "
              >
                {pageSizeOptions.map((pageSize) => (
                  <option key={`size-${pageSize}`} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={13}
                className="
                  pointer-events-none
                  absolute
                  right-2.5
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />
            </div>

            <span className="text-xs text-slate-500">data</span>
          </div>

          <div className="relative w-full sm:w-[320px]">
            <Search
              size={16}
              className="
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="
                h-10
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                pl-10
                pr-4
                text-sm
                text-slate-700
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-blue-400
                focus:bg-white
                focus:ring-4
                focus:ring-blue-50
              "
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="w-[70px] px-5 py-4 text-left text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                  No
                </th>

                {columns.map((column) => {
                  const key = String(column.key);

                  const align = column.align ?? "left";

                  const isSorted =
                    currentSort === `${key},asc` ||
                    currentSort === `${key},desc`;

                  const isDesc = currentSort === `${key},desc`;

                  return (
                    <th
                      key={`header-${key}`}
                      style={{
                        width: column.width,
                      }}
                      className={`
                          px-4
                          py-4
                          text-${align}
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-[0.06em]
                          text-slate-500
                          ${column.sortable ? "cursor-pointer select-none" : ""}
                        `}
                      onClick={() => handleSort(key, column.sortable)}
                    >
                      <span
                        className={`
                            inline-flex
                            items-center
                            gap-1.5
                            ${align === "center" ? "justify-center" : ""}
                            ${align === "right" ? "justify-end" : ""}
                          `}
                      >
                        {column.label}

                        {column.sortable && (
                          <ChevronDown
                            size={13}
                            className={`
                                transition-transform
                                ${
                                  isSorted && isDesc
                                    ? "rotate-180 text-[#1358A8]"
                                    : isSorted
                                      ? "text-[#1358A8]"
                                      : "text-slate-300"
                                }
                              `}
                          />
                        )}
                      </span>
                    </th>
                  );
                })}

                {actions && (
                  <th className="w-[140px] px-5 py-4 text-right text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                    Aksi
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading &&
                Array.from({
                  length: Math.min(size, 5),
                }).map((_, index) => (
                  <tr key={`loading-row-${index}`}>
                    <td colSpan={columnCount} className="px-5 py-5">
                      <div className="h-5 animate-pulse rounded-lg bg-slate-100" />
                    </td>
                  </tr>
                ))}

              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={columnCount} className="px-5 py-20 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                        <Search size={20} />
                      </div>

                      <p className="text-sm font-semibold text-slate-700">
                        {search ? "Data tidak ditemukan" : emptyMessage}
                      </p>

                      <p className="mt-1.5 text-xs leading-5 text-slate-400">
                        {search
                          ? "Coba gunakan kata pencarian yang berbeda."
                          : "Belum terdapat data yang dapat ditampilkan."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                data.map((row, index) => {
                  const rowId = getRowId(row);

                  const hasValidId =
                    rowId !== undefined &&
                    rowId !== null &&
                    String(rowId).trim() !== "";

                  const rowKey = hasValidId
                    ? `row-${String(rowId)}`
                    : `row-index-${startRecord + index}`;

                  return (
                    <tr
                      key={rowKey}
                      className="group transition-colors hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4.5 text-sm font-medium text-slate-400">
                        {startRecord + index}
                      </td>

                      {columns.map((column) => {
                        const key = String(column.key);

                        const value = (row as Record<string, unknown>)[key];

                        return (
                          <td
                            key={`cell-${rowKey}-${key}`}
                            className={`
                  px-4
                  py-4.5
                  text-${column.align ?? "left"}
                  text-sm
                  text-slate-600
                `}
                          >
                            {column.render
                              ? column.render(value, row, index)
                              : String(value ?? "-")}
                          </td>
                        );
                      })}

                      {actions && (
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            {actions.edit && (
                              <button
                                type="button"
                                title="Edit"
                                onClick={() => actions.edit?.(row)}
                                className="
      inline-flex
      items-center
      gap-1.5
      rounded-full
      cursor-pointer
      border
      border-emerald-100
      bg-emerald-50
      px-3
      py-1.5
      text-xs
      font-medium
      text-emerald-600
      transition-all
      duration-200
      hover:border-emerald-200
      hover:bg-emerald-100
      hover:text-emerald-700
      active:scale-95
    "
                              >
                                <Pencil size={14} />
                                <span>Edit</span>
                              </button>
                            )}

                            {actions.delete && (
                              <button
                                type="button"
                                title="Hapus"
                                onClick={() => actions.delete?.(row)}
                                className="
      inline-flex
      items-center
      gap-1.5
      rounded-full
      border
      border-red-100
      bg-red-50
      px-3
      py-1.5
      text-xs
      font-medium
      cursor-pointer
      text-red-500
      transition-all
      duration-200
      hover:border-red-200
      hover:bg-red-100
      hover:text-red-600
      active:scale-95
    "
                              >
                                <Trash2 size={14} />
                                <span>Hapus</span>
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-100 bg-white px-5 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-xs text-slate-500">
            {totalElements > 0 ? (
              <>
                Menampilkan{" "}
                <span className="font-semibold text-slate-700">
                  {startRecord}
                </span>{" "}
                -{" "}
                <span className="font-semibold text-slate-700">
                  {endRecord}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-700">
                  {totalElements}
                </span>{" "}
                data
              </>
            ) : (
              "Tidak ada data"
            )}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() => onPageChange?.(0)}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                text-slate-400
                transition
                hover:bg-slate-50
                hover:text-slate-700
                disabled:pointer-events-none
                disabled:opacity-40
              "
            >
              <ChevronsLeft size={15} />
            </button>

            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() => onPageChange?.(page - 1)}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                text-slate-400
                transition
                hover:bg-slate-50
                hover:text-slate-700
                disabled:pointer-events-none
                disabled:opacity-40
              "
            >
              <ChevronLeft size={15} />
            </button>

            {paginationItems.map((item, index) =>
              item === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="flex h-9 w-7 items-center justify-center text-xs text-slate-400"
                >
                  ...
                </span>
              ) : (
                <button
                  type="button"
                  key={`page-${item}`}
                  onClick={() => onPageChange?.(item)}
                  className={`
                      flex
                      h-9
                      min-w-9
                      items-center
                      justify-center
                      rounded-lg
                      px-2
                      text-xs
                      font-semibold
                      transition
                      ${
                        page === item
                          ? "bg-[#1358A8] text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                      }
                    `}
                >
                  {item + 1}
                </button>
              ),
            )}

            <button
              type="button"
              disabled={
                page >= totalPages - 1 || totalElements === 0 || loading
              }
              onClick={() => onPageChange?.(page + 1)}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                text-slate-400
                transition
                hover:bg-slate-50
                hover:text-slate-700
                disabled:pointer-events-none
                disabled:opacity-40
              "
            >
              <ChevronRight size={15} />
            </button>

            <button
              type="button"
              disabled={
                page >= totalPages - 1 || totalElements === 0 || loading
              }
              onClick={() => onPageChange?.(totalPages - 1)}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-slate-200
                text-slate-400
                transition
                hover:bg-slate-50
                hover:text-slate-700
                disabled:pointer-events-none
                disabled:opacity-40
              "
            >
              <ChevronsRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
