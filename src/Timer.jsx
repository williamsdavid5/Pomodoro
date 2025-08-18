import { useEffect, useState } from 'react'
import './timer.css'

export default function Timer({ ativo, onStart }) {

    const [tempo, setTempo] = useState(0.10 * 60);
    const [terminou, setTerminou] = useState(false);

    useEffect(() => {
        let intervalo;
        if (ativo && tempo > 0) {
            intervalo = setInterval(() => {
                setTempo((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }

        if (tempo == 0) {
            setTerminou(true);
        }

        return () => clearInterval(intervalo);

    }, [ativo, tempo]);

    const formatarTempo = (segundos) => {
        const min = String(Math.floor(segundos / 60)).padStart(2, '0');
        const sec = String(segundos % 60).padStart(2, '0');
        return `${min}:${sec}`;
    };

    return (
        <div id="timerBloco" className={terminou ? "finalizado" : ""}>
            <h1>{formatarTempo(tempo)}</h1>

            {
                terminou ?
                    (<h1 style={{ width: '40px' }}>✓</h1>) :
                    (ativo ?
                        <button id='botaoPausar' onClick={() => onStart(null)}>Pausar</button> :
                        <button id='botaoIniciar' onClick={onStart}>Iniciar</button>)
            }


        </div>
    )
}