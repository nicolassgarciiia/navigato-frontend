import Navbar from "@/components/Navbar";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <div className={styles.container}>
        <h1 className={styles.title}>Navigato</h1>
        <p className={styles.subtitle}>
          La aplicación de cálculo de rutas creada por <br />
          Nicolás Garcia Edo · Alberto del Olmo Barres · Matías Aguilar Barría
        </p>

        <img
          className={styles.map}
          src="/mapa_portada.jpg"
          alt="Mapa ilustrativo"
        />
      </div>
    </>
  );
}
