import { useEffect, useRef, useState } from 'react'
import './App.css'
import RelogioIcon from './assets/relogioIcon.svg'
import RelogioIcon2 from '../public/relogioIcon.svg'
import Timer from './Timer'

function App() {
  const hoje = new Date().toLocaleDateString("pt-br");

  const [ativo, setAtivo] = useState(null);
  const [dataHora, setDataHora] = useState(new Date());

  const [timersData, setTimersData] = useState(() => {
    const saved = localStorage.getItem('pomodoroTimersData');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.dia === hoje) return parsed;
    }
    return {
      dia: hoje,
      timersConcluidos: [],
      timersProgresso: Array.from({ length: 4 }, () => ({ tempoDecorrido: 0, pausado: true }))
    };
  });

  // refs para os 4 timers
  const timerRefs = useRef([]);

  // Salva no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('pomodoroTimersData', JSON.stringify(timersData));
  }, [timersData]);

  // Relógio
  useEffect(() => {
    const id = setInterval(() => setDataHora(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const handleTimerFinished = (index) => {
    const now = new Date();
    const novoConcluido = {
      index,
      data: hoje,
      hora: now.toLocaleTimeString("pt-br"),
      timestamp: now.getTime()
    };

    setTimersData(prev => ({
      ...prev,
      dia: hoje,
      timersConcluidos: [...prev.timersConcluidos, novoConcluido],
      timersProgresso: prev.timersProgresso.map((t, i) =>
        i === index ? { tempoDecorrido: 0, pausado: true } : t
      )
    }));

    avisarTimerFinalizado();

    setAtivo(index < 3 ? index + 1 : null);
  };

  const handleTimerProgress = (index, tempoDecorrido, pausado) => {
    setTimersData(prev => ({
      ...prev,
      dia: hoje,
      timersProgresso: prev.timersProgresso.map((t, i) =>
        i === index ? { tempoDecorrido, pausado } : t
      )
    }));
  };

  const isTimerConcluido = (index) =>
    timersData.timersConcluidos.some(t => t.index === index);

  const todosConcluidos = timersData.timersConcluidos.length === 4;

  const handleReset = () => {
    if (window.confirm("Tem certeza que deseja resetar os timers? Isso apagará todos os dados de hoje.")) {
      localStorage.removeItem('pomodoroTimersData');
      setTimersData({
        dia: hoje,
        timersConcluidos: [],
        timersProgresso: Array.from({ length: 4 }, () => ({ tempoDecorrido: 0, pausado: true }))
      });
      setAtivo(null);
    }
  };

  // pedir permissão de notificação
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  function avisarTimerFinalizado() {
    if (Notification.permission === "granted") {
      new Notification("⏱️ Timer Finalizado!", {
        body: "Seu cronômetro terminou.",
        icon: RelogioIcon2
      });
    }
  }

  // 🔔 Salvamento automático GLOBAL a cada 30s (usa snapshots dos timers)
  useEffect(() => {
    const id = setInterval(() => {
      timerRefs.current.forEach((ref, i) => {
        const snap = ref?.getSnapshot?.();
        if (!snap) return;
        // chama a MESMA função de salvar progresso
        handleTimerProgress(snap.index, snap.tempoDecorrido, snap.pausado);
      });
    }, 30000);
    return () => clearInterval(id);
  }, []); // roda sempre, independente de estado

  return (
    <>
      <div id='divTitulo'>
        <img src={RelogioIcon} alt="Ícone de relógio" style={{ width: "100px" }} />
        <div id='texto'>
          <h1>Pomodoro do dia</h1>
          <p>Complete sua meta diária e seja produtivo, amanhã o relógio reinicia.</p>
          <h3>Dia {dataHora.toLocaleDateString("pt-br")}, {dataHora.toLocaleTimeString("pt-br")}</h3>
        </div>
      </div>

      <div id='divPomodoros'>
        {[0, 1, 2, 3].map((i) => {
          const timerConcluido = timersData.timersConcluidos.find(t => t.index === i);
          return (
            <Timer
              key={i}
              ref={el => (timerRefs.current[i] = el)}
              index={i}
              ativo={ativo === i}
              concluido={isTimerConcluido(i)}
              progressoInicial={timersData.timersProgresso[i]}
              horaConclusao={timerConcluido?.hora}
              onStart={() => setAtivo(ativo === i ? null : i)}
              onFinish={handleTimerFinished}
              onProgress={handleTimerProgress}
            />
          );
        })}
      </div>

      {todosConcluidos && (
        <button id='botaoResetar' onClick={handleReset}>
          Resetar
        </button>
      )}
    </>
  )
}

export default App
