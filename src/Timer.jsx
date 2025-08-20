import { useEffect, useState, useRef, forwardRef } from 'react'
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
    const TEMPO_TOTAL = 25 * 60; // 25 minutos em segundos
    const [tempoRestante, setTempoRestante] = useState(TEMPO_TOTAL - (progressoInicial?.tempoDecorrido || 0));
    const [terminou, setTerminou] = useState(false);
    const [horaFim, setHoraFim] = useState(null);

    const horaInicioRef = useRef(null);
    const intervaloRef = useRef(null);
    const pausadoRef = useRef(true);
    const ultimoSaveRef = useRef(Date.now());
    const tempoRestanteRef = useRef(tempoRestante);
    const ativoRef = useRef(ativo);
    const ultimaAtualizacaoRef = useRef(Date.now());

    // Manter refs sempre atualizadas
    useEffect(() => {
        tempoRestanteRef.current = tempoRestante;
        ativoRef.current = ativo;
    }, [tempoRestante, ativo]);

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
            pausadoRef.current = true;
        } else {
            setTerminou(false);
            setHoraFim(null);
            const tempoInicial = progressoInicial?.tempoDecorrido || 0;
            setTempoRestante(TEMPO_TOTAL - tempoInicial);
            pausadoRef.current = progressoInicial?.pausado !== false;

            if (tempoInicial > 0 && !progressoInicial?.pausado) {
                horaInicioRef.current = Date.now() - (tempoInicial * 1000);
            } else {
                horaInicioRef.current = null;
            }
        }
    }, [concluido, horaConclusao, progressoInicial]);

    // Efeito para salvamento automático a cada 30 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            if (ativoRef.current && !pausadoRef.current) {
                const agora = Date.now();
                if (agora - ultimoSaveRef.current >= 30000) {
                    const tempoDecorrido = TEMPO_TOTAL - tempoRestanteRef.current;
                    console.log(`Salvamento automático - Timer ${index}: ${tempoDecorrido}s`);
                    onProgress(index, tempoDecorrido, false);
                    ultimoSaveRef.current = agora;
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [index, onProgress]);

    // Função para atualizar o timer baseada em setInterval
    const iniciarContagem = () => {
        if (intervaloRef.current) {
            clearInterval(intervaloRef.current);
        }

        intervaloRef.current = setInterval(() => {
            if (pausadoRef.current || !horaInicioRef.current || terminou) {
                return;
            }

            const agora = Date.now();
            const tempoDecorrido = (agora - horaInicioRef.current) / 1000;
            const novoRestante = Math.max(0, TEMPO_TOTAL - tempoDecorrido);

            setTempoRestante(novoRestante);
            ultimaAtualizacaoRef.current = agora;

            if (novoRestante <= 0) {
                const now = new Date();
                setTerminou(true);
                setHoraFim(now);
                onFinish(index);
                onProgress(index, TEMPO_TOTAL, true);
                pausadoRef.current = true;
                horaInicioRef.current = null;
                clearInterval(intervaloRef.current);
            }
        }, 100); // Atualiza a cada 100ms para maior precisão
    };

    // Função para corrigir o tempo quando a aba volta ao foco
    const corrigirTempo = () => {
        if (!pausadoRef.current && horaInicioRef.current && !terminou) {
            const agora = Date.now();
            const tempoDecorrido = (agora - horaInicioRef.current) / 1000;
            const novoRestante = Math.max(0, TEMPO_TOTAL - tempoDecorrido);

            setTempoRestante(novoRestante);

            if (novoRestante <= 0) {
                const now = new Date();
                setTerminou(true);
                setHoraFim(now);
                onFinish(index);
                onProgress(index, TEMPO_TOTAL, true);
                pausadoRef.current = true;
                horaInicioRef.current = null;
            }
        }
    };

    // Controle da animação
    useEffect(() => {
        if (ativo && !terminou) {
            pausadoRef.current = false;

            if (!horaInicioRef.current) {
                const tempoDecorrido = TEMPO_TOTAL - tempoRestante;
                horaInicioRef.current = Date.now() - (tempoDecorrido * 1000);
            }

            ultimoSaveRef.current = Date.now();
            iniciarContagem();
        } else {
            pausadoRef.current = true;
            if (intervaloRef.current) {
                clearInterval(intervaloRef.current);
            }

            const tempoDecorrido = TEMPO_TOTAL - tempoRestante;
            onProgress(index, tempoDecorrido, true);
        }

        return () => {
            if (intervaloRef.current) {
                clearInterval(intervaloRef.current);
            }
        };
    }, [ativo, terminou]);

    // Event listener para quando a aba volta ao foco
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                corrigirTempo();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', corrigirTempo);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', corrigirTempo);
        };
    }, []);

    const handleStartPause = () => {
        if (ativo) {
            // Pausar
            pausadoRef.current = true;
            const tempoDecorrido = TEMPO_TOTAL - tempoRestante;
            onProgress(index, tempoDecorrido, true);
            ultimoSaveRef.current = Date.now();
        } else {
            // Iniciar/Continuar
            pausadoRef.current = false;
            if (!horaInicioRef.current) {
                const tempoDecorrido = TEMPO_TOTAL - tempoRestante;
                horaInicioRef.current = Date.now() - (tempoDecorrido * 1000);
            }
            ultimoSaveRef.current = Date.now();
            const tempoDecorrido = TEMPO_TOTAL - tempoRestante;
            onProgress(index, tempoDecorrido, false);
            iniciarContagem();
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