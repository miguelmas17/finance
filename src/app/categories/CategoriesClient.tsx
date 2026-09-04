"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CategoryNode } from "@/lib/categories";

const KIND_LABEL: Record<string, string> = {
  EXPENSE: "Gasto",
  INCOME: "Ingreso",
  INVESTMENT: "Inversión",
};

const COLORS = [
  "#f97316",
  "#3b82f6",
  "#8b5cf6",
  "#ef4444",
  "#ec4899",
  "#eab308",
  "#64748b",
  "#16a34a",
  "#0891b2",
  "#6b7280",
];

export function CategoriesClient({
  initialCategories,
}: {
  initialCategories: CategoryNode[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [newName, setNewName] = useState("");
  const [newKind, setNewKind] = useState("EXPENSE");
  const [newColor, setNewColor] = useState(COLORS[0]);
  const [childName, setChildName] = useState<Record<string, string>>({});

  async function refresh() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
    router.refresh();
  }

  async function createCategory(parentId: string | null) {
    const name = parentId ? childName[parentId] : newName;
    if (!name?.trim()) return;

    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        kind: newKind,
        color: newColor,
        parentId,
      }),
    });

    if (parentId) {
      setChildName((prev) => ({ ...prev, [parentId]: "" }));
    } else {
      setNewName("");
    }
    await refresh();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta categoría? Los movimientos asociados quedarán sin categoría.")) {
      return;
    }
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    await refresh();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-surface p-4">
        <h2 className="mb-3 font-semibold">Nueva rama principal</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Nombre (p.ej. Educación)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          <select
            value={newKind}
            onChange={(e) => setNewKind(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            {Object.entries(KIND_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`h-6 w-6 rounded-full border-2 ${
                  newColor === c ? "border-foreground" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
          <button
            onClick={() => createCategory(null)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Añadir rama
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.id} className="rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-lg">{cat.icon}</span>
                <span className="font-semibold">{cat.name}</span>
                <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted">
                  {KIND_LABEL[cat.kind] ?? cat.kind}
                </span>
              </div>
              <button
                onClick={() => remove(cat.id)}
                className="text-xs text-muted hover:text-danger hover:underline"
              >
                Eliminar rama
              </button>
            </div>

            <ul className="mt-3 space-y-1 pl-6">
              {(cat.children ?? []).map((child) => (
                <li
                  key={child.id}
                  className="flex items-center justify-between rounded-md px-2 py-1 text-sm hover:bg-background"
                >
                  <span>
                    {child.icon} {child.name}
                  </span>
                  <button
                    onClick={() => remove(child.id)}
                    className="text-xs text-muted hover:text-danger hover:underline"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-2 flex gap-2 pl-6">
              <input
                type="text"
                placeholder="Nueva subcategoría"
                value={childName[cat.id] ?? ""}
                onChange={(e) =>
                  setChildName((prev) => ({ ...prev, [cat.id]: e.target.value }))
                }
                className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm"
              />
              <button
                onClick={() => createCategory(cat.id)}
                className="rounded-md border border-border px-3 py-1 text-sm hover:bg-background"
              >
                Añadir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
