import { useEffect, useState } from 'react'
import './App.css'
import RelogioIcon from './assets/relogioIcon.svg'
import Timer from './Timer'

function App() {

  const [ativo, setAtivo] = useState(null);
  const [dataHora, setDataHora] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => {
      setDataHora(new Date());
    })

    return () => clearInterval(intervalo);
  }, 1000);


  const handleTimerFinished = (index) => {
    // Avança para o próximo timer se houver
    if (index < 3) {
      setAtivo(index + 1);
    } else {
      setAtivo(null); // Todos os timers finalizados
    }
  };

  return (
    <>
      <div id='divTitulo'>
        <img src={RelogioIcon}></img>
        <div id='texto'>
          <h1>Pomodoro do dia</h1>
          <p>Complete sua meta diária e seja produtivo, amanhã o relógio reinicia.</p>
          <h3>Dia {dataHora.toLocaleDateString("pt-br")}, {dataHora.toLocaleTimeString("pt-br")}</h3>
        </div>
      </div>
      <div id='divPomodoros'>
        {[0, 1, 2, 3].map((i) => (
          <Timer key={i} index={i} ativo={ativo === i} onStart={() => setAtivo(ativo === i ? null : i)} onFinish={handleTimerFinished}></Timer>
        ))}
      </div>
    </>
  )
}

export default App
