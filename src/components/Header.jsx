import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import styles from "./Header.module.css";

function formatDateMMYYYY() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  return `${month}.${year}`;
}

function Header() {
  const [currentDate, setCurrentDate] = useState(formatDateMMYYYY());

  useEffect(() => {
    setCurrentDate(formatDateMMYYYY());
  }, []);

  const handleSettings = () => {
    console.log("Настройка — заглушка, будет на следующем шаге");
  };

  const handleExit = async () => {
    try {
      await invoke("close_window");
    } catch (e) {
      console.log("Выход — заглушка, на следующем шаге подключу Rust-команду");
    }
  };

  return (
    <header className={styles.appHeader}>
      <div className={styles.headerLeft}>{currentDate}</div>
      <div className={styles.headerRight}>
        <button className={styles.btn} id="btn-settings" onClick={handleSettings}>
          Настройка
        </button>
        <button className={`${styles.btn} ${styles.btnExit}`} id="btn-exit" onClick={handleExit}>
          Выход
        </button>
      </div>
    </header>
  );
}

export default Header;