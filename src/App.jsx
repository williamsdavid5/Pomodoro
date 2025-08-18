import './App.css'
import RelogioIcon from './assets/relogioIcon.svg'
import Timer from './Timer'

function App() {

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
        <Timer></Timer>
        <Timer></Timer>
        <Timer></Timer>
        <Timer></Timer>
      </div>
    </>
  )
}

export default App
