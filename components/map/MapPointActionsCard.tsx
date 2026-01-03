"use client";

interface Props {
  lat: number;
  lng: number;
  toponimo?: string;
  onSavePOI: () => void;
  onSetOrigin: () => void;
  onSetDestination: () => void;
  onClose: () => void;
}

export default function MapPointActionsCard({
  lat,
  lng,
  toponimo,
  onSavePOI,
  onSetOrigin,
  onSetDestination,
  onClose,
}: Props) {
  return (
    <div className="bg-white p-4 rounded shadow w-80 space-y-3">
      <h3 className="font-semibold text-lg">📍 Punto seleccionado</h3>

      <p className="text-sm text-gray-600">
        {toponimo ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`}
      </p>

      <div className="space-y-2">
        <button
          onClick={onSavePOI}
          className="w-full bg-green-600 text-white py-2 rounded"
        >
          Guardar como lugar
        </button>

        <button
          onClick={onSetOrigin}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          Usar como origen
        </button>

        <button
          onClick={onSetDestination}
          className="w-full bg-purple-600 text-white py-2 rounded"
        >
          Usar como destino
        </button>
      </div>

      <button
        onClick={onClose}
        className="w-full text-sm text-gray-500 underline"
      >
        Cancelar
      </button>
    </div>
  );
}
