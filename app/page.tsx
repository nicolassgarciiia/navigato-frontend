import Navbar from "@/components/Navbar";
import styles from "./home.module.css";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <div className={styles.container}>
        <h1 className={styles.title}>
          Encuentra siempre la ruta que mejor se adapte a tus necesidades
        </h1>

        <p className={styles.subtitle}>
          Navega con facilidad y descubre nuevos destinos con nuestra plataforma
        </p>

        <div className={styles.imageContainer}>
          <img
            className={styles.mapImage}
            src="/mapa_portada.png"
            alt="Interfaz de navegación"
          />
        </div>
      </div>
    </>
  );
}
