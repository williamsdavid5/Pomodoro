import { useEffect, useState, useRef } from 'react'
import './timer.css'

export default function Timer({ index, ativo, concluido, horaConclusao, onStart, onFinish }) {
    const TEMPO_INICIAL = 25 * 60; // 6 segundos para teste
    const [tempoDecorrido, setTempoDecorrido] = useState(0);
    const [terminou, setTerminou] = useState(false);
    const [horaFim, setHoraFim] = useState(null);
    const inicioRef = useRef(null);
    const requestRef = useRef();
    const tempoTotalRef = useRef(TEMPO_INICIAL);

    // Inicializa o estado baseado no prop 'concluido'
    useEffect(() => {
        if (concluido) {
            setTerminou(true);
            setTempoDecorrido(TEMPO_INICIAL);
            if (horaConclusao) {
                // Corrige a criação da data a partir da string salva
                const [horas, minutos, segundos] = horaConclusao.split(':');
                const hoje = new Date();
                hoje.setHours(horas, minutos, segundos);
                setHoraFim(hoje);
            }
        } else {
            setTerminou(false);
            setTempoDecorrido(0);
            tempoTotalRef.current = TEMPO_INICIAL;
        }
    }, [concluido, horaConclusao]);

    // Animação frame a frame para contagem mais precisa
    const animarTempo = (timestamp) => {
        if (!inicioRef.current) {
            inicioRef.current = timestamp;
        }

        const tempoPassado = Math.floor((timestamp - inicioRef.current) / 1000);
        const tempoRestante = Math.max(0, tempoTotalRef.current - tempoPassado);

        setTempoDecorrido(tempoTotalRef.current - tempoRestante);

        if (tempoRestante <= 0) {
            const now = new Date();
            setTerminou(true);
            setHoraFim(now);
            onFinish(index);
        } else {
            requestRef.current = requestAnimationFrame(animarTempo);
        }
    };

    // Controle da animação
    useEffect(() => {
        if (ativo && !terminou) {
            inicioRef.current = null;
            tempoTotalRef.current = TEMPO_INICIAL - tempoDecorrido;
            requestRef.current = requestAnimationFrame(animarTempo);
        } else {
            cancelAnimationFrame(requestRef.current);
        }

        return () => cancelAnimationFrame(requestRef.current);
    }, [ativo, terminou]);

    // Reset do timer quando desativado
    useEffect(() => {
        if (!ativo && !terminou) {
            setTempoDecorrido(0);
            tempoTotalRef.current = TEMPO_INICIAL;
        }
    }, [ativo, terminou]);

    const tempoRestante = Math.max(0, TEMPO_INICIAL - tempoDecorrido);

    const formatarTempo = (segundos) => {
        const min = String(Math.floor(segundos / 60)).padStart(2, '0');
        const sec = String(segundos % 60).padStart(2, '0');
        return `${min}:${sec}`;
    };

    return (
        <>
            <div id="timerBloco" className={terminou ? "finalizado" : ""}>
                <h1>{formatarTempo(tempoRestante)}</h1>

                {
                    terminou ?
                        (<h1 style={{ width: '40px' }}>✓</h1>) :
                        (ativo ?
                            <button id='botaoPausar' onClick={() => onStart()}>Pausar</button> :
                            <button id='botaoIniciar' onClick={onStart}>Iniciar</button>)
                }
            </div>
            {terminou && horaFim && (
                <h3>Finalizado às {horaFim.toLocaleTimeString("pt-br")}</h3>
            )}
        </>
    )
}