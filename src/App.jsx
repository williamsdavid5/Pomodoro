import { useState } from 'react'
import './App.css'
import RelogioIcon from './assets/relogioIcon.svg'
import Timer from './Timer'

function App() {

  const [ativo, setAtivo] = useState(null);

  return (
    <>
      <div id='divTitulo'>
        <img src={RelogioIcon}></img>
        <div id='texto'>
          <h1>Pomodoro do dia</h1>
          <p>Complete sua meta diária e seja produtivo, amanhã o relógio reinicia.</p>
        </div>
      </div>
      <div id='divPomodoros'>
        {[0, 1, 2, 3].map((i) => (
          <Timer key={i} ativo={ativo === i} onStart={() => setAtivo(i)}></Timer>
        ))}
      </div>
    </>
  )
}

export default App
