"use client";
import BarraNavegacao from "@/components/BarraNavegacao";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Equipamentos() {
  const equipamentos = [
    {
      id: "EPI-001",
      nome: "Capacete de segurança",
      imagem: "/equipamentos/capacete.png",
    },
    {
      id: "EPI-002",
      nome: "Luva de proteção",
      imagem: "/equipamentos/luva.png",
    },
    {
      id: "EPI-003",
      nome: "Óculos de proteção",
      imagem: "/equipamentos/oculos.png",
    },
    {
      id: "EPI-004",
      nome: "Botina de segurança",
      imagem: "/equipamentos/botina.png",
    },
    {
      id: "EPI-005",
      nome: "Protetor auricular",
      imagem: "/equipamentos/protetor-auricular.png",
    },
    {
      id: "EPI-006",
      nome: "Máscara respiratória",
      imagem: "/equipamentos/mascara.png",
    },
    {
      id: "EPI-007",
      nome: "Colete refletivo",
      imagem: "/equipamentos/colete.png",
    },
    {
      id: "EPI-008",
      nome: "Cinto de segurança",
      imagem: "/equipamentos/cinto.png",
    },
  ];

  return (
    <div className="d-flex min-vh-100 bg-light">
     <BarraNavegacao></BarraNavegacao>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-grow-1 p-4">
        {/* CABEÇALHO */}
        <header className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "#142D52" }}>
              Equipamentos EPI
            </h2>

            <p className="text-secondary mb-0">
              Gerencie os equipamentos de proteção individual cadastrados.
            </p>
          </div>

        </header>

        {/* PESQUISA E CONTAGEM */}
        <section className="card border-0 shadow-sm mb-4">
          <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div className="flex-grow-1" style={{ maxWidth: "550px" }}>
              <label className="form-label fw-semibold"> Pesquisar equipamento</label>

            {/* Barra de pesquisa */}
            <input id="pesquisa" type="search" className="form-control" placeholder="Digite o nome do equipamento..."/>
            </div>

            <div className="text-secondary">
                <button type="button" className="btn btn-primary">+ Registrar novo empréstimo</button>
            </div>
          </div>
        </section>
        <div className="table-responsive">
              <table className="table ">
                <thead>
                  <tr>
                    {/* falta tamanho e quantidade nos detalhes*/}
                    <th>ID</th>
                    <th>Imagem</th>
                    <th>Nome</th>
                    <th>Tipo</th> 
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                <tr>
                    <th scope="row" className="text-primary">1</th>
                    <td><img src="#" alt="#" /></td>
                    <td>Capacete de segurança</td>
                    <td>Proteção capacete</td>
                    <td><span className="badge bg-success-subtle text-success">Em andamento</span></td>
                    <td>
                        <button className="btn btn-outline-primary btn-sm me-1">
                            <i className="bi bi-eye"></i>
                        </button>

                        <button className="btn btn-outline-primary btn-sm me-1">
                            <i className="bi bi-pencil-square"></i>
                        </button>

                        <button className="btn btn-outline-danger btn-sm">
                            <i className="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>

                </tbody>
              </table>
            </div>

        
        </main>
    </div>
  );
}