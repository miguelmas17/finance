"use client";

import { useEffect, useMemo, useState } from "react";
import { CategoryNode, flattenCategories } from "@/lib/categories";
import { formatCurrency, formatDate } from "@/lib/format";

type Transaction = {
  id: string;
  date: string;
  description: string;
  merchant: string | null;
  amount: number;
  currency: string;
  categoryId: string | null;
  category: { id: string; name: string; icon: string; color: string } | null;
};

type EditDraft = { date: string; description: string; amount: string };

function toDateInputValue(date: string) {
  return date.slice(0, 10);
}

export function TransactionsTable({
  categories,
}: {
  categories: CategoryNode[];
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<EditDraft | null>(null);

  const options = useMemo(() => flattenCategories(categories), [categories]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (categoryFilter) params.set("categoryId", categoryFilter);

    const timeout = setTimeout(() => {
      setLoading(true);
      fetch(`/api/transactions?${params.toString()}`)
        .then((res) => res.json())
        .then(setTransactions)
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, categoryFilter]);

  async function updateCategory(id: string, categoryId: string) {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, categoryId } : t)),
    );
    await fetch(`/api/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId: categoryId || null }),
    });
  }

  async function remove(id: string) {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
  }

  function startEditing(t: Transaction) {
    setEditingId(t.id);
    setDraft({
      date: toDateInputValue(t.date),
      description: t.description,
      amount: t.amount.toString(),
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setDraft(null);
  }

  async function saveEditing(id: string) {
    if (!draft) return;
    const amount = Number(draft.amount);
    if (!draft.description.trim() || Number.isNaN(amount)) return;

    const res = await fetch(`/api/transactions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: draft.date,
        description: draft.description.trim(),
        amount,
      }),
    });
    const updated = await res.json();
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t)),
    );
    cancelEditing();
  }

  function exportCsv() {
    const header = ["Fecha", "Descripción", "Comercio", "Categoría", "Importe", "Moneda"];
    const rows = transactions.map((t) => [
      toDateInputValue(t.date),
      t.description,
      t.merchant ?? "",
      t.category ? t.category.name : "",
      t.amount.toString().replace(".", ","),
      t.currency,
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(";"),
      )
      .join("\n");
    const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `movimientos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="Buscar por descripción o comercio…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
        >
          <option value="">Todas las categorías</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {"—".repeat(o.depth)} {o.icon} {o.label}
            </option>
          ))}
        </select>
        <button
          onClick={exportCsv}
          disabled={transactions.length === 0}
          className="rounded-md border border-border px-3 py-2 text-sm hover:bg-surface disabled:opacity-50"
        >
          Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-surface">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Descripción</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2 text-right">Importe</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => {
              const isEditing = editingId === t.id;
              return (
                <tr key={t.id} className="border-b border-border last:border-0">
                  {isEditing && draft ? (
                    <>
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={draft.date}
                          onChange={(e) =>
                            setDraft({ ...draft, date: e.target.value })
                          }
                          className="w-full rounded-md border border-border bg-background px-2 py-1"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={draft.description}
                          onChange={(e) =>
                            setDraft({ ...draft, description: e.target.value })
                          }
                          className="w-full rounded-md border border-border bg-background px-2 py-1"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={t.categoryId ?? ""}
                          onChange={(e) => updateCategory(t.id, e.target.value)}
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                        >
                          <option value="">Sin categoría</option>
                          {options.map((o) => (
                            <option key={o.id} value={o.id}>
                              {"—".repeat(o.depth)} {o.icon} {o.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          step="0.01"
                          value={draft.amount}
                          onChange={(e) =>
                            setDraft({ ...draft, amount: e.target.value })
                          }
                          className="w-24 rounded-md border border-border bg-background px-2 py-1 text-right"
                        />
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        <button
                          onClick={() => saveEditing(t.id)}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Guardar
                        </button>{" "}
                        <button
                          onClick={cancelEditing}
                          className="text-xs text-muted hover:underline"
                        >
                          Cancelar
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="whitespace-nowrap px-3 py-2 text-muted">
                        {formatDate(t.date)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium">{t.description}</div>
                        {t.merchant && (
                          <div className="text-xs text-muted">{t.merchant}</div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={t.categoryId ?? ""}
                          onChange={(e) => updateCategory(t.id, e.target.value)}
                          className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                        >
                          <option value="">Sin categoría</option>
                          {options.map((o) => (
                            <option key={o.id} value={o.id}>
                              {"—".repeat(o.depth)} {o.icon} {o.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td
                        className={`whitespace-nowrap px-3 py-2 text-right font-medium ${
                          t.amount < 0 ? "text-danger" : "text-success"
                        }`}
                      >
                        {formatCurrency(t.amount, t.currency)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2 text-right">
                        <button
                          onClick={() => startEditing(t)}
                          className="text-xs text-muted hover:text-foreground hover:underline"
                        >
                          Editar
                        </button>{" "}
                        <button
                          onClick={() => remove(t.id)}
                          className="text-xs text-muted hover:text-danger hover:underline"
                        >
                          Borrar
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {!loading && transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted">
                  No hay movimientos que coincidan con el filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-right text-sm text-muted">
        {transactions.length} movimientos · Total:{" "}
        <span className="font-semibold text-foreground">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
