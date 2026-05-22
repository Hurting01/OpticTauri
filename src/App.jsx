import Header from "./components/Header";
import "./styles/index.css";

if (import.meta.env.PROD) {
  document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}

function App() {
  return (
    <>
      <Header />
      <main>
        <h1 className="page-title">Главная</h1>
      </main>
    </>
  );
}

export default App;