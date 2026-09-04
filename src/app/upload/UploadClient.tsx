"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import {
  CategoryNode,
  findCategoryIdByName,
  flattenCategories,
} from "@/lib/categories";
import { formatCurrency } from "@/lib/format";

type DraftTransaction = {
  date: string;
  description: string;
  merchant: string;
  amount: number;
  currency: string;
  categoryId: string | null;
};

export function UploadClient() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "analyzing" | "review" | "saving" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftTransaction[]>([]);
  const [uploadId, setUploadId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const options = flattenCategories(categories);

  const onDrop = useCallback(
    async (accepted: File[]) => {
      const file = accepted[0];
      if (!file) return;

      setError(null);
      setPreview(URL.createObjectURL(file));
      setStatus("analyzing");

      try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "No se ha podido analizar la imagen.");
        }

        setUploadId(data.uploadId);
        setDrafts(
          (data.transactions as Array<{
            date: string;
            description: string;
            merchant: string | null;
            amount: number;
            currency: string;
            suggestedCategory: string;
          }>).map((t) => ({
            date: t.date,
            description: t.description,
            merchant: t.merchant ?? "",
            amount: t.amount,
            currency: t.currency || "EUR",
            categoryId: findCategoryIdByName(categories, t.suggestedCategory),
          })),
        );
        setStatus("review");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado.");
        setStatus("error");
      }
    },
    [categories],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  function updateDraft(index: number, patch: Partial<DraftTransaction>) {
    setDrafts((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    );
  }

  function removeDraft(index: number) {
    setDrafts((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveAll() {
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          drafts.map((d) => ({ ...d, uploadId })),
        ),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "No se han podido guardar los movimientos.");
      }
      router.push(`/transactions?guardados=${drafts.length}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
      setStatus("review");
    }
  }

  function reset() {
    setPreview(null);
    setDrafts([]);
    setUploadId(null);
    setStatus("idle");
    setError(null);
  }

  return (
    <div className="space-y-6">
      {status !== "review" && status !== "saving" && (
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border bg-surface"
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-4xl">📸</p>
          <p className="mt-3 font-medium">
            Arrastra aquí la captura de tu app bancaria
          </p>
          <p className="text-sm text-muted">
            o haz clic para seleccionar una imagen (PNG, JPG…)
          </p>
        </div>
      )}

      {status === "analyzing" && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p>Analizando la captura con IA, esto puede tardar unos segundos…</p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          {error}
        </div>
      )}

      {preview && (status === "review" || status === "saving") && (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL local, no optimizable por next/image */}
            <img
              src={preview}
              alt="Captura subida"
              className="w-full rounded-lg border border-border object-contain"
            />
            <button
              onClick={reset}
              className="mt-3 text-sm text-muted underline hover:text-foreground"
            >
              Subir otra captura
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold">
              Revisa los movimientos detectados ({drafts.length})
            </h2>
            {drafts.length === 0 && (
              <p className="text-sm text-muted">
                No se ha detectado ningún movimiento en la imagen.
              </p>
            )}
            <div className="space-y-3">
              {drafts.map((d, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 gap-2 rounded-lg border border-border bg-surface p-3 sm:grid-cols-12 sm:items-center"
                >
                  <input
                    type="date"
                    value={d.date}
                    onChange={(e) => updateDraft(i, { date: e.target.value })}
                    className="rounded-md border border-border bg-background px-2 py-1 text-sm sm:col-span-2"
                  />
                  <input
                    type="text"
                    value={d.description}
                    onChange={(e) =>
                      updateDraft(i, { description: e.target.value })
                    }
                    placeholder="Descripción"
                    className="rounded-md border border-border bg-background px-2 py-1 text-sm sm:col-span-4"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={d.amount}
                    onChange={(e) =>
                      updateDraft(i, { amount: Number(e.target.value) })
                    }
                    className="rounded-md border border-border bg-background px-2 py-1 text-right text-sm sm:col-span-2"
                  />
                  <select
                    value={d.categoryId ?? ""}
                    onChange={(e) =>
                      updateDraft(i, { categoryId: e.target.value || null })
                    }
                    className="rounded-md border border-border bg-background px-2 py-1 text-sm sm:col-span-3"
                  >
                    <option value="">Sin categoría</option>
                    {options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {"—".repeat(o.depth)} {o.icon} {o.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeDraft(i)}
                    className="text-sm text-danger hover:underline sm:col-span-1"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>

            {drafts.length > 0 && (
              <div className="flex items-center justify-between border-t border-border pt-4">
                <p className="text-sm text-muted">
                  Total: {formatCurrency(
                    drafts.reduce((sum, d) => sum + (d.amount || 0), 0),
                  )}
                </p>
                <button
                  onClick={saveAll}
                  disabled={status === "saving"}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {status === "saving" ? "Guardando…" : "Guardar movimientos"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
