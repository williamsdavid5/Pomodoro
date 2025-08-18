import './App.css'
import RelogioIcon from './assets/relogioIcon.svg'

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
    </>
  )
}

export default App
