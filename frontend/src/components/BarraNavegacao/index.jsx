export default function BarraNavegacao() {
  return (
    <header>
      <nav
        className="d-flex flex-column p-3 vh-100"
        style={{
          backgroundColor: "#1E4D8F",
          width: "260px",
          minWidth: "260px",
        }}
      >
        {/* Logo */}
        <a href="/" className="text-decoration-none border-bottom border-light pb-4 mb-4">
          <div className="d-flex align-items-center justify-content-between gap-2">
            <h3 className="text-white fw-bold mb-0">Gestor EPI</h3>
            <img src="/logo_icon.png" alt="Logo Gestor EPI" style={{ width: "45px" }}/>
          </div>

          <small className="text-white-50"> Sistema de gerenciamento</small>
        </a>

        {/* Links */}
        <div className="d-flex flex-column gap-2">
          <a href="/" className="text-white text-decoration-none rounded p-3 fw-semibold"
            style={{ backgroundColor: "#1769F6" }}
          >
            Início
          </a>

          <a
            href="/equipamentos"
            className="text-white text-decoration-none rounded p-3"
          >
            Equipamentos
          </a>

          <a
            href="/emprestimos"
            className="text-white text-decoration-none rounded p-3"
          >
            Empréstimos
          </a>

          <a
            href="/devolucoes"
            className="text-white text-decoration-none rounded p-3"
          >
            Devoluções
          </a>

        </div>

        {/* Rodapé */}
        <div className="mt-auto border-top border-light pt-3">
          <small className="text-white-50 px-2">
            Gestão de EPIs
          </small>
        </div>

      </nav>
    </header>
  );
}
