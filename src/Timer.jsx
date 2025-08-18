import { useEffect, useState, useRef } from 'react'
import './timer.css'

export default function Timer({
    index,
    ativo,
    concluido,
    progressoInicial,
    horaConclusao,
    onStart,
    onFinish,
    onProgress
}) {
    const TEMPO_TOTAL = 25 * 60; // 25 minutos em segundos
    const [tempoRestante, setTempoRestante] = useState(TEMPO_TOTAL - (progressoInicial?.tempoDecorrido || 0));
    const [terminou, setTerminou] = useState(false);
    const [horaFim, setHoraFim] = useState(null);
    const ultimoTempoRef = useRef(Date.now());
    const requestRef = useRef();
    const pausadoRef = useRef(true);
    const tempoInicialRef = useRef(progressoInicial?.tempoDecorrido || 0);

    // Inicialização do timer
    useEffect(() => {
        if (concluido) {
            setTerminou(true);
            setTempoRestante(0);
            if (horaConclusao) {
                const [horas, minutos, segundos] = horaConclusao.split(':');
                const hoje = new Date();
                hoje.setHours(horas, minutos, segundos);
                setHoraFim(hoje);
            }
        } else {
            setTempoRestante(TEMPO_TOTAL - (progressoInicial?.tempoDecorrido || 0));
            pausadoRef.current = progressoInicial?.pausado !== false;
            tempoInicialRef.current = progressoInicial?.tempoDecorrido || 0;
        }
    }, [concluido, horaConclusao, progressoInicial]);

    // Animação do timer
    const atualizarTimer = () => {
        if (pausadoRef.current) {
            requestRef.current = requestAnimationFrame(atualizarTimer);
            return;
        }

        const agora = Date.now();
        const deltaTempo = (agora - ultimoTempoRef.current) / 1000; // em segundos
        ultimoTempoRef.current = agora;

        setTempoRestante(prev => {
            const novoRestante = prev - deltaTempo;
            const tempoDecorrido = TEMPO_TOTAL - novoRestante;

            // Salva automaticamente a cada 30 segundos
            if (Math.floor(tempoDecorrido) % 30 === 0) {
                onProgress(index, tempoDecorrido, false);
            }

            if (novoRestante <= 0) {
                const now = new Date();
                setTerminou(true);
                setHoraFim(now);
                onFinish(index);
                onProgress(index, TEMPO_TOTAL, true);
                return 0;
            }

            return novoRestante;
        });

        requestRef.current = requestAnimationFrame(atualizarTimer);
    };

    // Controle da animação
    useEffect(() => {
        if (ativo && !terminou) {
            pausadoRef.current = false;
            ultimoTempoRef.current = Date.now();
            requestRef.current = requestAnimationFrame(atualizarTimer);
        } else {
            pausadoRef.current = true;
            cancelAnimationFrame(requestRef.current);
            const tempoDecorrido = TEMPO_TOTAL - tempoRestante;
            onProgress(index, tempoDecorrido, true);
        }

        return () => cancelAnimationFrame(requestRef.current);
    }, [ativo, terminou]);

    const handleStartPause = () => {
        if (ativo) {
            // Pausar
            pausadoRef.current = true;
            const tempoDecorrido = TEMPO_TOTAL - tempoRestante;
            onProgress(index, tempoDecorrido, true);
        } else {
            // Iniciar
            pausadoRef.current = false;
            ultimoTempoRef.current = Date.now();
            onProgress(index, TEMPO_TOTAL - tempoRestante, false);
        }
        onStart();
    };

    const formatarTempo = (segundos) => {
        const segundosInt = Math.max(0, Math.floor(segundos));
        const min = String(Math.floor(segundosInt / 60)).padStart(2, '0');
        const sec = String(segundosInt % 60).padStart(2, '0');
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
                            <button id='botaoPausar' onClick={handleStartPause}>Pausar</button> :
                            <button id='botaoIniciar' onClick={handleStartPause}>Iniciar</button>)
                }
            </div>
            {terminou && horaFim && (
                <h3>Finalizado às {horaFim.toLocaleTimeString("pt-br")}</h3>
            )}
        </>
    )
}