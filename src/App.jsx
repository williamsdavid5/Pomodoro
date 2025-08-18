import { useEffect, useState } from 'react'
import './App.css'
import RelogioIcon from './assets/relogioIcon.svg'
import Timer from './Timer'

function App() {
  const [ativo, setAtivo] = useState(null);
  const [dataHora, setDataHora] = useState(new Date());
  const [timersConcluidos, setTimersConcluidos] = useState([]);

  // Carrega e filtra os timers do dia atual
  useEffect(() => {
    const hoje = new Date().toLocaleDateString("pt-br");
    const savedTimers = localStorage.getItem('pomodoroTimers');

    if (savedTimers) {
      const todosTimers = JSON.parse(savedTimers);
      const timersHoje = todosTimers.filter(t => t.data === hoje);
      setTimersConcluidos(timersHoje);

      // Remove timers de outros dias do localStorage
      if (timersHoje.length !== todosTimers.length) {
        localStorage.setItem('pomodoroTimers', JSON.stringify(timersHoje));
      }
    }
  }, []);

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

    const novosConcluidos = [...timersConcluidos, novoConcluido];

    // Salva no localStorage
    localStorage.setItem('pomodoroTimers', JSON.stringify(novosConcluidos));
    setTimersConcluidos(novosConcluidos);

    // Avança para o próximo timer se houver
    if (index < 3) {
      setAtivo(index + 1);
    } else {
      setAtivo(null); // Todos os timers finalizados
    }
  };

  // Verifica se o timer já foi concluído hoje
  const isTimerConcluido = (index) => {
    return timersConcluidos.some(t => t.index === index);
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
          const timerConcluido = timersConcluidos.find(t => t.index === i);
          return (
            <Timer
              key={i}
              index={i}
              ativo={ativo === i}
              concluido={isTimerConcluido(i)}
              horaConclusao={timerConcluido?.hora}
              onStart={() => setAtivo(ativo === i ? null : i)}
              onFinish={handleTimerFinished}
            />
          );
        })}
      </div>
    </>
  )
}

export default App