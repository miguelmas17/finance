export default function InvestmentsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Inversión</h1>
        <p className="text-muted">
          Próximamente: seguimiento de carteras, aportaciones y rentabilidad.
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-surface p-10 text-center">
        <p className="text-4xl">📈</p>
        <p className="mt-3 text-lg font-medium">Esta sección está en construcción</p>
        <p className="mt-1 text-muted">
          De momento puedes registrar tus aportaciones e ingresos por
          inversión como movimientos con la categoría &ldquo;Inversión&rdquo;
          desde <span className="font-medium">Subir gasto</span> o{" "}
          <span className="font-medium">Movimientos</span>. Aquí iremos
          añadiendo seguimiento de carteras y rentabilidad.
        </p>
      </div>
    </div>
  );
}
