"use client";

import { useEffect, useState } from "react";
import { vehicleFacade } from "@/facade/vehicleFacade";
import userPreferencesFacade from "@/facade/userPreferencesFacade";
import styles from "./PreferencesModal.module.css";

interface Props {
  onClose: () => void;
}

export default function PreferencesModal({ onClose }: Props) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [defaultVehicleId, setDefaultVehicleId] = useState<string>("");
  const [routeType, setRouteType] = useState<
    "rapida" | "corta" | "economica"
  >("economica");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const vehiclesRes = await vehicleFacade.listVehicles();
      if (vehiclesRes.ok) setVehicles(vehiclesRes.data);

      const prefsRes = await userPreferencesFacade.getPreferences();
      if (prefsRes.ok) {
        setDefaultVehicleId(prefsRes.data?.defaultVehicleId ?? "");
        setRouteType(prefsRes.data?.defaultRouteType ?? "economica");
      }
    }

    loadData();
  }, []);

  const savePreferences = async () => {
    console.log("💾 Guardar preferencias"); // ← DEBUG (verás esto en consola)
    setSaving(true);
    setError(null);

    if (defaultVehicleId) {
      const resVehicle =
        await userPreferencesFacade.setDefaultVehicle(defaultVehicleId);

      if (!resVehicle || !resVehicle.ok) {
        setSaving(false);
        setError(
          resVehicle?.error ??
            "No se pudo guardar el vehículo por defecto"
        );
        return;
      }
    }

    const resRoute =
      await userPreferencesFacade.setDefaultRouteType(routeType);

    if (!resRoute || !resRoute.ok) {
      setSaving(false);
      setError(
        resRoute?.error ??
          "No se pudo guardar el tipo de ruta por defecto"
      );
      return;
    }

    setSaving(false);
    onClose();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Preferencias</h2>

        <label>Vehículo por defecto</label>
        <select
          value={defaultVehicleId}
          onChange={(e) => setDefaultVehicleId(e.target.value)}
          disabled={saving}
        >
          <option value="">Selecciona un vehículo</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.nombre} ({v.matricula})
            </option>
          ))}
        </select>

        <label>Tipo de ruta por defecto</label>
        <select
          value={routeType}
          onChange={(e) =>
            setRouteType(e.target.value as any)
          }
          disabled={saving}
        >
          <option value="rapida">Rápida</option>
          <option value="corta">Corta</option>
          <option value="economica">Económica</option>
        </select>

        {error && <span className={styles.error}>{error}</span>}

        <div className={styles.actions}>
          <button type="button" onClick={onClose} disabled={saving}>
            Cancelar
          </button>

          {/* 🔥 CLAVE: type="button" */}
          <button
            type="button"
            onClick={savePreferences}
            className={styles.primary}
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
