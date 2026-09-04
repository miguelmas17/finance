import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/StatCard";

export const dynamic = "force-dynamic";
import { CategoryPieChart, MonthlyBarChart } from "./DashboardCharts";
import { formatCurrency, formatDate, monthLabel } from "@/lib/format";

export default async function Home() {
  const [transactions, budgets] = await Promise.all([
    prisma.transaction.findMany({
      include: { category: { include: { parent: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.budget.findMany({ include: { category: true } }),
  ]);

  const now = new Date();
  const currentMonthTx = transactions.filter((t) => {
    const d = new Date(t.date);
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });

  const gastosMes = currentMonthTx
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const ingresosMes = currentMonthTx
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const balanceMes = ingresosMes - gastosMes;

  const categoryTotals = new Map<
    string,
    { name: string; color: string; value: number }
  >();
  for (const t of transactions) {
    if (t.amount >= 0) continue;
    const top = t.category?.parent ?? t.category;
    const key = top?.id ?? "sin-categoria";
    const current = categoryTotals.get(key) ?? {
      name: top?.name ?? "Sin categoría",
      color: top?.color ?? "#9ca3af",
      value: 0,
    };
    current.value += Math.abs(t.amount);
    categoryTotals.set(key, current);
  }
  const categoryData = Array.from(categoryTotals.values()).sort(
    (a, b) => b.value - a.value,
  );

  const categoryMonthSpend = new Map<string, number>();
  for (const t of currentMonthTx) {
    if (t.amount >= 0) continue;
    const topId = t.category?.parent?.id ?? t.category?.id;
    if (!topId) continue;
    categoryMonthSpend.set(
      topId,
      (categoryMonthSpend.get(topId) ?? 0) + Math.abs(t.amount),
    );
  }
  const budgetProgress = budgets
    .map((b) => ({
      id: b.id,
      name: b.category.name,
      icon: b.category.icon,
      color: b.category.color,
      amount: b.amount,
      spent: categoryMonthSpend.get(b.categoryId) ?? 0,
    }))
    .sort((a, b) => b.spent / b.amount - a.spent / a.amount);

  const months: { key: string; month: string; gastos: number; ingresos: number }[] =
    [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      month: monthLabel(d),
      gastos: 0,
      ingresos: 0,
    });
  }
  for (const t of transactions) {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = months.find((m) => m.key === key);
    if (!bucket) continue;
    if (t.amount < 0) bucket.gastos += Math.abs(t.amount);
    else bucket.ingresos += t.amount;
  }

  const recent = transactions.slice(0, 6);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Resumen</h1>
          <p className="text-muted">
            Tu control de gastos de un vistazo, mes actual.
          </p>
        </div>
        <Link
          href="/upload"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          + Subir captura de gastos
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Gastos del mes" value={formatCurrency(gastosMes)} tone="danger" />
        <StatCard label="Ingresos del mes" value={formatCurrency(ingresosMes)} tone="success" />
        <StatCard
          label="Balance del mes"
          value={formatCurrency(balanceMes)}
          tone={balanceMes >= 0 ? "success" : "danger"}
        />
      </div>

      {budgetProgress.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Presupuestos del mes</h2>
            <Link href="/categories" className="text-sm text-primary hover:underline">
              Gestionar
            </Link>
          </div>
          <div className="space-y-3">
            {budgetProgress.map((b) => {
              const percent = Math.min(100, (b.spent / b.amount) * 100);
              const over = b.spent > b.amount;
              const barColor = over
                ? "var(--danger)"
                : percent >= 80
                  ? "#eab308"
                  : b.color;
              return (
                <div key={b.id}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>
                      {b.icon} {b.name}
                    </span>
                    <span className={over ? "font-medium text-danger" : "text-muted"}>
                      {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-background">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${percent}%`, backgroundColor: barColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface p-10 text-center">
          <p className="text-lg font-medium">Todavía no tienes movimientos</p>
          <p className="mt-1 text-muted">
            Sube tu primera captura de pantalla para empezar a ver tus gastos
            organizados por categorías.
          </p>
          <Link
            href="/upload"
            className="mt-4 inline-block rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Subir primera captura
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-4">
              <h2 className="mb-2 font-semibold">Gastos por categoría (mes actual y anteriores)</h2>
              <CategoryPieChart data={categoryData} />
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <h2 className="mb-2 font-semibold">Ingresos y gastos por mes</h2>
              <MonthlyBarChart data={months} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Últimos movimientos</h2>
              <Link href="/transactions" className="text-sm text-primary hover:underline">
                Ver todos
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {recent.map((t) => (
                <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium">{t.description}</p>
                    <p className="text-muted">
                      {formatDate(t.date)}
                      {t.category ? ` · ${t.category.icon} ${t.category.name}` : ""}
                    </p>
                  </div>
                  <span
                    className={`font-medium ${t.amount < 0 ? "text-danger" : "text-success"}`}
                  >
                    {formatCurrency(t.amount, t.currency)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
