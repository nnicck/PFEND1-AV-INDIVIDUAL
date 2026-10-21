import Link from "next/link";
import NotFoundBuddy from "@/components/NotFoundBuddy"

export default function Notfound(){
    return(
        <>
        <div className="caixa-dois">
        <NotFoundBuddy className="notFoundBud"/>
            <div>
                <h4>Conteúdo não encontrado!</h4>
                <h2 className="txt-erro">Erro 404</h2>
                <Link href={"/"} className="btn-voltar" >Voltar</Link>
            </div>
        </div> 
        </>
    )
}