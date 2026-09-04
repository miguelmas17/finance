import { UploadClient } from "./UploadClient";

export const dynamic = "force-dynamic";

export default function UploadPage() {
  const hasApiKey = Boolean(process.env.ANTHROPIC_API_KEY);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Subir gasto</h1>
        <p className="text-muted">
          Sube una captura de pantalla de tu app o web bancaria y la IA
          extraerá los movimientos automáticamente.
        </p>
      </div>
      {!hasApiKey && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          Falta configurar <code className="font-mono">ANTHROPIC_API_KEY</code>{" "}
          en el archivo <code className="font-mono">.env</code> del servidor.
          Sin ella no se pueden analizar capturas. Consigue una clave en{" "}
          <a
            href="https://console.anthropic.com/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            console.anthropic.com
          </a>
          , añádela a <code className="font-mono">.env</code> y reinicia el
          servidor.
        </div>
      )}
      <UploadClient />
    </div>
  );
}
