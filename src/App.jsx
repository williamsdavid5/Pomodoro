import { useEffect, useState } from 'react'
import './App.css'
import RelogioIcon from './assets/relogioIcon.svg'
import Timer from './Timer'

function App() {
  const [ativo, setAtivo] = useState(null);
  const [dataHora, setDataHora] = useState(new Date());
  const [timersData, setTimersData] = useState(() => {
    // Carrega os dados salvos ou inicializa
    const savedData = localStorage.getItem('pomodoroTimersData');
    return savedData ? JSON.parse(savedData) : {
      timersConcluidos: [],
      timersProgresso: Array(4).fill({ tempoDecorrido: 0, pausado: true })
    };
  });

  // Atualiza o localStorage sempre que os dados mudam
  useEffect(() => {
    localStorage.setItem('pomodoroTimersData', JSON.stringify(timersData));
  }, [timersData]);

  // Atualização do relógio principal
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
      data: now.toLocaleDateString("pt-br"),
      hora: now.toLocaleTimeString("pt-br"),
      timestamp: now.getTime()
    };

    setTimersData(prev => ({
      ...prev,
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
        <img src={RelogioIcon} alt="Ícone de relógio"></img>
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