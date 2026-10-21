"use client";

export default function ModalConfirmacao({
    aberto,
    titulo = "Confirmar ação",
    mensagem = "Deseja continuar?",
    erro = "",
    carregando = false,
    textoConfirmar = "Confirmar",
    textoCancelar = "Cancelar",
    onConfirmar,
    onFechar,
}) {
    if (!aberto) return null;

    function fechar() {
        if (!carregando) {
            onFechar();
        }
    }

    return (
        <div
            className="modal d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloModal"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow">
                    <div className="modal-header">
                        <h5
                            className="modal-title fw-bold"
                            id="tituloModal"
                        >
                            {titulo}
                        </h5>

                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Fechar"
                            onClick={fechar}
                            disabled={carregando}
                        />
                    </div>

                    <div className="modal-body">
                        {erro ? (
                            <div className="alert alert-danger mb-0">
                                {erro}
                            </div>
                        ) : (
                            mensagem
                        )}
                    </div>

                    <div className="modal-footer justify-content-center">
                        {erro ? (
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={fechar}
                            >
                                Fechar
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={fechar}
                                    disabled={carregando}
                                >
                                    {textoCancelar}
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={onConfirmar}
                                    disabled={carregando}
                                >
                                    {carregando
                                        ? "Aguarde..."
                                        : textoConfirmar}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}