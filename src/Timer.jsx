import { useEffect, useState } from 'react'
import './timer.css'

export default function Timer() {

    const [tempo, setTempo] = useState(0.10 * 60);
    const [rodando, setRodando] = useState(false);
    const [terminou, setTerminou] = useState(false);

    useEffect(() => {
        let intervalo;
        if (rodando && tempo > 0) {
            intervalo = setInterval(() => {
                setTempo((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }

        if (tempo == 0) {
            setTerminou(true);
        }

        return () => clearInterval(intervalo);

    }, [rodando, tempo]);

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
                    <h1 style={{ width: '40px' }}>✓</h1> :
                    rodando ?
                        <button id='botaoPausar' onClick={() => setRodando(false)}>Pausar</button> :
                        <button id='botaoIniciar' onClick={() => setRodando(true)}>Iniciar</button>
            }


        </div>
    )
}