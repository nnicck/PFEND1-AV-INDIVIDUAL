import LoadingSpinning from "@/components/LoadingSpinning";

export default function loading(){
    return(
        <>
        <main>
         <div className="caixa">
            <div className="flex">
                <h2 className="txt-loading">Carregando</h2>
                <LoadingSpinning className="engrenagem"></LoadingSpinning>
            </div>
        </div> 
        </main>
        </>
    )
}