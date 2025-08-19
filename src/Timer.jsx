import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react'
import './timer.css'

function Timer({
    index,
    ativo,
    concluido,
    progressoInicial,
    horaConclusao,
    onStart,
    onFinish,
    onProgress
}, ref) {
    const TEMPO_TOTAL = 30 * 60; // 30 minutos em segundos
    const [tempoRestante, setTempoRestante] = useState(TEMPO_TOTAL - (progressoInicial?.tempoDecorrido || 0));
    const [terminou, setTerminou] = useState(false);
    const [horaFim, setHoraFim] = useState(null);

    const ultimoTempoRef = useRef(Date.now());
    const requestRef = useRef();
    const pausadoRef = useRef(true);
    const terminouRef = useRef(concluido);
    const tempoRestanteRef = useRef(tempoRestante);

    // manter ref sempre atualizada
    useEffect(() => {
        tempoRestanteRef.current = tempoRestante;
    }, [tempoRestante]);

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
            terminouRef.current = true;
            pausadoRef.current = true;
        } else {
            setTerminou(false);
            setHoraFim(null);
            setTempoRestante(TEMPO_TOTAL - (progressoInicial?.tempoDecorrido || 0));
            terminouRef.current = false;
            pausadoRef.current = progressoInicial?.pausado !== false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [concluido, horaConclusao, progressoInicial]);

    // Animação do timer
    const atualizarTimer = () => {
        if (pausadoRef.current) {
            requestRef.current = requestAnimationFrame(atualizarTimer);
            return;
        }

        const agora = Date.now();
        const delta = (agora - ultimoTempoRef.current) / 1000;
        ultimoTempoRef.current = agora;

        setTempoRestante(prev => {
            const novo = prev - delta;
            if (novo <= 0 && !terminouRef.current) {
                const now = new Date();
                terminouRef.current = true;
                setTerminou(true);
                setHoraFim(now);
                onFinish(index);
                onProgress(index, TEMPO_TOTAL, true);
                return 0;
            }
            return novo;
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
            // salva snapshot imediato ao sair do ativo
            const tempoDecorrido = Math.min(TEMPO_TOTAL, TEMPO_TOTAL - Math.max(0, tempoRestanteRef.current));
            onProgress(index, tempoDecorrido, true);
        }
        return () => cancelAnimationFrame(requestRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ativo, terminou]);

    const handleStartPause = () => {
        if (ativo) {
            // Pausar
            pausadoRef.current = true;
            const tempoDecorrido = Math.min(TEMPO_TOTAL, TEMPO_TOTAL - Math.max(0, tempoRestanteRef.current));
            onProgress(index, tempoDecorrido, true);
        } else {
            // Iniciar
            pausadoRef.current = false;
            ultimoTempoRef.current = Date.now();
            const tempoDecorrido = Math.min(TEMPO_TOTAL, TEMPO_TOTAL - Math.max(0, tempoRestanteRef.current));
            onProgress(index, tempoDecorrido, false);
        }
        onStart();
    };

    const formatarTempo = (segundos) => {
        const s = Math.max(0, Math.floor(segundos));
        const min = String(Math.floor(s / 60)).padStart(2, '0');
        const sec = String(s % 60).padStart(2, '0');
        return `${min}:${sec}`;
    };

    // 👉 expõe um snapshot para o App salvar a cada 30s
    useImperativeHandle(ref, () => ({
        getSnapshot: () => {
            const restante = Math.max(0, tempoRestanteRef.current);
            const tempoDecorrido = Math.min(TEMPO_TOTAL, TEMPO_TOTAL - restante);
            return {
                index,
                tempoDecorrido,
                pausado: pausadoRef.current,
                terminou: terminouRef.current,
                total: TEMPO_TOTAL,
            };
        }
    }), [index]);

    return (
        <>
            <div id="timerBloco" className={terminou ? "finalizado" : ""}>
                <h1>{formatarTempo(tempoRestante)}</h1>
                {
                    terminou
                        ? (<h1 style={{ width: '40px' }}>✓</h1>)
                        : (ativo
                            ? <button id='botaoPausar' onClick={handleStartPause}>Pausar</button>
                            : <button id='botaoIniciar' onClick={handleStartPause}>Iniciar</button>)
                }
            </div>
            {terminou && horaFim && (
                <h3>25 minutos concluídos! Finalizado às {horaFim.toLocaleTimeString("pt-br")}</h3>
            )}
        </>
    )
}

export default forwardRef(Timer);
