export default function CardsResumo({titEpi, qtdEpi, descEpi}){
    return(
    <div className="card" style={{ width: "20rem" }}>
        <div className="card-body">
          <h5 className="card-title text-center">{titEpi}</h5>
          <h1 className="card-text text-center text-primary">{qtdEpi}</h1>
          <p className="card-text text-center">{descEpi}</p>
        </div>
      </div>
    )
}