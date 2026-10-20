"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import CardsResumo from "@/components/CardsResumo";
import BarraNavegacao from "@/components/BarraNavegacao";
import RegistroEmprestimo from "@/components/RegistroEmprestimo";
import { useEffect, useState } from "react";
 //guardar informações que podem mudar e atualizar a tela automaticamente quando essas informações mudam

export default function Home() {
  
    //Empréstimo
    const [emprestimos, setEmprestimos] = useState([]);
    const [erro, setErro] = useState("");
    useEffect(() => {
        async function carregarEmprestimos() {
            try {
                const resposta = await fetch(
                    "http://localhost:3001/api/emprestimos"
                );

                if (!resposta.ok) {
                    throw new Error("Erro ao buscar empréstimos");
                }

                const resultado = await resposta.json();
                console.log(resultado.dados);
                
                setEmprestimos(resultado.dados);
            } catch (erro) {
                console.error(erro);
            }
        }

        carregarEmprestimos();
    }, []);



    //Dashboard

    const [resumo, setResumo] = useState({
    totalEpis: 0,
    disponivel: 0,
    emprestimosAtivos: 0,
    devolucoesAtrasadas: 0
    });

    useEffect(() => {
        async function carregarResumo() {
            try {
                const resposta = await fetch(
                    "http://localhost:3001/api/dashboard/resumo"
                );

                if (!resposta.ok) {
                    throw new Error("Erro ao carregar resumo");
                }

                const resultado = await resposta.json();

                setResumo(resultado.dados);
            } catch (erro) {
                console.error("Erro ao carregar resumo:", erro);
            }
        }

        carregarResumo();
    }, []);



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
      <Link
          href={"/emprestimos/novo"}
          className="btn btn-primary"
      >
          + Registrar novo empréstimo
      </Link>
    </div>


      <div className="container d-flex justify-content-between gap-2 mt-5">
        <CardsResumo titEpi="Total de EPIs" qtdEpi={Number(resumo.totalEpis)} descEpi="cadastros no sistemas"></CardsResumo>
        <CardsResumo titEpi="Disponível" qtdEpi={Number(resumo.disponivel)} descEpi="itens disponível"></CardsResumo>
        <CardsResumo titEpi="Empréstimos ativos" qtdEpi={Number(resumo.emprestimosAtivos)} descEpi="em andamento"></CardsResumo>
        <CardsResumo titEpi="Devoluções atrasadas" qtdEpi={Number(resumo.devolucoesAtrasadas)} descEpi="requerem atenção"></CardsResumo>
      </div>

      {erro && <p className="text-danger">{erro}</p>}

      {/* tabela */}
      <div className="card border-0 rounded-3 mt-4 w-100 bg-transparent">

  {/* Título */}
  <div className="card-header py-3 px-4 bg-transparent border-0">
    <h5 className="mb-0">Empréstimos recentes</h5>
  </div>

  <div className="card-body p-0">

    {/* Filtros */}
    <div className="px-4 pt-2 pb-4">
      <div className="row g-2 align-items-end">

        <div className="col-12 col-lg-4">
          <label className="form-label">Pesquisar</label>
          <input type="text" className="form-control" placeholder="ID, funcionário ou equipamento..."/>
        </div>

        <div className="col-12 col-md-6 col-lg-2">
          <label className="form-label">Data inicial</label>
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
    <div className="table-responsive">
      <table className="table ">
        <thead>
          <tr>
            <th>ID</th>
            <th>Data</th>
            <th>Funcionário</th>
            <th>Equipamento</th>
            <th>Quantidade</th>
            <th>Devolução prevista</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {emprestimos.map((emprestimo) => (
              <tr key={emprestimo.emprestimo_id}>
                  <td className="text-primary">
                      {emprestimo.emprestimo_id}
                  </td>

                  <td>
                      {new Date(emprestimo.data_emprestimo)
                          .toLocaleDateString("pt-BR", {
                              timeZone: "UTC"
                          })}
                  </td>

                  <td>{emprestimo.funcionario_nome}</td>

                  <td>{emprestimo.equipamento_nome}</td>

                  <td>{emprestimo.qtd_emprestimo}</td>

                  <td>
                    {new Date(emprestimo.data_prevista_devolucao)
                    .toLocaleDateString("pt-BR", {
                        timeZone: "UTC"
                    })}
                    </td>

                  <td>{emprestimo.status}</td>

                  <td>
                    <Link
                        href={`/emprestimos/editar/${emprestimo.emprestimo_id}`}
                        className="btn btn-primary btn-sm"
                    >
                        Editar
                    </Link>
                  </td>
              </tr>
          ))}
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
