import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <>
    <header>
    <nav className="navbar navbar-expand-lg d-flex align-items-center justify-content-around gap-5 py-3"  style={{ backgroundColor: "#1E4D8F" }}>
    <a className="navbar-brand text-white" href="#">
      <div className="d-flex align-items-center gap-1">
        <span>Gestor API</span>
        <img src="/logo_icon.png" style={{ width: "25px" }} />
      </div>
    </a>

    <div className="navbar-nav d-flex flex-row align-items-center gap-5 fs-5">
      <a className="nav-link text-white" href="">início</a>

      <a className="nav-link text-white" href="">equipamentos</a>

      <button type="button" className="btn btn-primary">+ Criar um novo</button>
    </div>
    </nav>
    </header>
    <div className="d-flex flex-column align-items-center justify-content-around mt-5">
      <h2 className="text-black">Gerenciador de Equipamentos de Proteção Individual</h2>
      <h5 className="text-secondary">Controle e acompanhamento dos EPIs cadastrados.</h5>
    </div>
    <div className="container mt-5">
      <div className="card" style={{ width: "25rem" }}>
        <div className="card-body">
          <h5 className="card-title">Card title</h5>
          <h6 className="card-subtitle mb-2 text-body-secondary">Card subtitle</h6>
          <p className="card-text">
            Some quick example text to build on the card title and make up the bulk of
            the card’s content.
          </p>
          <a href="#" className="card-link">
            Card link
          </a>
          <a href="#" className="card-link">
            Another link
          </a>
        </div>
      </div>
    </div>

    
    </>
  );
}
