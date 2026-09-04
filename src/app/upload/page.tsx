import { UploadClient } from "./UploadClient";

export default function UploadPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Subir gasto</h1>
        <p className="text-muted">
          Sube una captura de pantalla de tu app o web bancaria y la IA
          extraerá los movimientos automáticamente.
        </p>
      </div>
      <UploadClient />
    </div>
  );
}
