import { useEffect, useState } from 'react'
import './App.css'
import RelogioIcon from './assets/relogioIcon.svg'
import Timer from './Timer'

function App() {
  const hoje = new Date().toLocaleDateString("pt-br");

  const [ativo, setAtivo] = useState(null);
  const [dataHora, setDataHora] = useState(new Date());
  const [timersData, setTimersData] = useState(() => {
    const savedData = localStorage.getItem('pomodoroTimersData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      // Verifica se é o mesmo dia
      if (parsed.dia === hoje) {
        return parsed;
      }
    }
    // Se não tiver nada ou for outro dia → reseta
    return {
      dia: hoje,
      timersConcluidos: [],
      timersProgresso: Array(4).fill({ tempoDecorrido: 0, pausado: true })
    };
  });

  // Salva no localStorage sempre que houver mudanças
  useEffect(() => {
    localStorage.setItem('pomodoroTimersData', JSON.stringify(timersData));
  }, [timersData]);

  // Atualiza o relógio
  useEffect(() => {
    const intervalo = setInterval(() => {
      setDataHora(new Date());
    }, 1000);

    return () => clearInterval(intervalo);
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

    if (index < 3) {
      setAtivo(index + 1);
    } else {
      setAtivo(null);
    }
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

  const isTimerConcluido = (index) => {
    return timersData.timersConcluidos.some(t => t.index === index);
  };

  return (
    <>
      <div id='divTitulo'>
        <img src={RelogioIcon} alt="Ícone de relógio" />
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
    </>
  )
}

export default App
