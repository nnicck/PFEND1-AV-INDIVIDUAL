"use client";
import BarraNavegacao from "@/components/BarraNavegacao";
import Link from "next/link";

export default function Equipamentos() {
  

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
              <Link href={"/equipamentos/novo"} className="btn btn-primary">
                + Registrar novo equipamento
              </Link>
            </div>
          </div>
        </section>
        <div className="table-responsive">
              <table className="table ">
                <thead>
                  <tr>
                    {/* falta tamanho e quantidade nos detalhes*/}
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Tipo</th>
                    <th>Qtd de equipamentos</th> 
                    {/* qtd máxima que pode ser editado, Não pode ser menor do que a qtd disponível*/}
                    <th>Qtd disponível</th>
                    {/* QTD disponível depende de quantas pessoas pegaram esse equipamentos específico (contando a quantidade de todas as pessoas que pegaram esse tal equipamento) */}
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                <tr>
                    <th scope="row" className="text-primary">1</th>
                    <td>Capacete de segurança</td>
                    <td>Proteção capacete</td>
                    <td>10</td>
                    <td>5</td> 
                    <td><span className="badge bg-success-subtle text-success">Em andamento</span></td>
                    <td>
                      <div className="d-flex gap-3">
                         <Link
                        href={"#"}
                        className="btn btn-primary btn-sm">
                        Editar
                      </Link>

                      <Link
                        href={"#"}
                        className="btn btn-sm btn-danger">
                        excluir
                      </Link>

                      </div>
                    </td>
                </tr>

                </tbody>
              </table>
            </div>

        
        </main>
    </div>
  );
}