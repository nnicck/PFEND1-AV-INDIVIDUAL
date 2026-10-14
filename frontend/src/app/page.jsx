import Image from "next/image";
import styles from "./page.module.css";
import CardsResumo from "@/components/CardsResumo";
import BarraNavegacao from "@/components/BarraNavegacao";

export default function Home() {
  return (
    <>
    <div className="d-flex flex-row">

    
    <BarraNavegacao></BarraNavegacao>
    <main className="flex-grow-1">
    <div className="d-flex justify-content-around align-items-center mt-5">
      <div className="d-flex flex-column align-items-center justify-content-center">
        <h2 className="text-black text-left">Olá! Seja bem-vindo!</h2>
        <h5 className="text-secondary">Aqui está um resumo dos EPIs e movimentação do sistema</h5>
      </div>
      <button type="button" className="btn btn-primary">+ Registrar novo empréstimo</button>
    </div>


      <div className="container d-flex justify-content-between gap-2 mt-5">
        <CardsResumo titEpi="Total de EPIs" qtdEpi="25" descEpi="cadastros no sistemas"></CardsResumo>
        <CardsResumo titEpi="Disponível" qtdEpi="45" descEpi="itens disponível"></CardsResumo>
        <CardsResumo titEpi="Empréstimos ativos" qtdEpi="55" descEpi="em andamento"></CardsResumo>
        <CardsResumo titEpi="Devoluções atrasadas" qtdEpi="55" descEpi="requerem atenção"></CardsResumo>
      </div>

      {/* tabela */}
      <div className="card border-0 rounded-3 mt-4 w-100 bg-transparent">

  {/* Título */}
  <div className="card-header py-3 px-4 bg-transparent border-0">
    <h5 className="mb-0">Empréstimos recentes</h5>
  </div>

  <div className="card-body p-0">

    {/* Filtros */}
    <div className="px-4 pt-2 pb-4">
      <div className="row g-3 align-items-end">

        <div className="col-12 col-lg-4">
          <label className="form-label">Pesquisar</label>
          <input
            type="text"
            className="form-control"
            placeholder="ID, funcionário ou equipamento..."
          />
        </div>

        <div className="col-12 col-md-6 col-lg-2">
          <label className="form-label">Data inicial</label>
          <input
            type="date"
            className="form-control"
          />
        </div>

        <div className="col-12 col-md-6 col-lg-2">
          <label className="form-label">Data final</label>
          <input
            type="date"
            className="form-control"
          />
        </div>

        <div className="col-12 col-lg-4">
          <label className="form-label">Status</label>
          <select className="form-select" defaultValue="">
            <option value="">Todos os status</option>
            <option value="andamento">Em andamento</option>
            <option value="devolvido">Devolvido</option>
            <option value="atrasado">Atrasado</option>
          </select>
        </div>

      </div>
    </div>

    {/* Tabela */}
    <div className="table-responsive w-100">
      <table className="table align-middle mb-0 w-100">

        <thead className="table-light">
          <tr>
            <th className="ps-4">ID</th>
            <th>Data</th>
            <th>Funcionário</th>
            <th>Equipamento</th>
            <th>Quantidade</th>
            <th>Status</th>
            <th className="text-center">Ações</th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td className="ps-4 fw-semibold text-primary">EMP-001</td>
            <td>14/10/2026</td>
            <td>João Silva</td>
            <td>Capacete de segurança</td>
            <td>1</td>
            <td>
              <span className="badge bg-success-subtle text-success">
                Em andamento
              </span>
            </td>
            <td className="text-center">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
              >
                Detalhes
              </button>
            </td>
          </tr>

          <tr>
            <td className="ps-4 fw-semibold text-primary">EMP-002</td>
            <td>13/10/2026</td>
            <td>Maria Santos</td>
            <td>Luva de proteção</td>
            <td>2</td>
            <td>
              <span className="badge bg-secondary-subtle text-secondary">
                Devolvido
              </span>
            </td>
            <td className="text-center">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
              >
                Detalhes
              </button>
            </td>
          </tr>

          <tr>
            <td className="ps-4 fw-semibold text-primary">EMP-003</td>
            <td>10/10/2026</td>
            <td>Pedro Oliveira</td>
            <td>Óculos de proteção</td>
            <td>1</td>
            <td>
              <span className="badge bg-danger-subtle text-danger">
                Atrasado
              </span>
            </td>
            <td className="text-center">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
              >
                Detalhes
              </button>
            </td>
          </tr>
        </tbody>

      </table>
    </div>

  </div>
</div>
      



    </main>
    </div>
    

    
    </>
  );
}
