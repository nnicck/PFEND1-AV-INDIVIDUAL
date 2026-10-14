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

      <div className="card shadow-sm border-0 rounded-3 mt-4">
        <div className="card-header py-3">
          <h5 className="mb-0">Empréstimos recentes</h5>
        </div>

        <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Data</th>
              <th>Funcionário</th>
              <th>Equipamento</th>
              <th>Quantidade</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>14/10/2026</td>
              <td>João Silva</td>
              <td>Capacete de segurança</td>
              <td>1</td>
              <td>
               <span className="badge bg-success-subtle text-success">Em andamento</span>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </main>
    </div>
    

    
    </>
  );
}
