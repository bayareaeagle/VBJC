
import './App.css'
import Navbar from './components/navbar'
import MainSection from './sections/main-section'

function App() {
  return (
    <div className="p-4 md:h-[90vh]">
      <nav>
        <Navbar />
      </nav>
      <main className="h-full items-center p-4 md:p-12 ">
        <MainSection />
      </main>
    </div>
  )
}

export default App
