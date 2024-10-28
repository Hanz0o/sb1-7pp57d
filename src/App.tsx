import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Video from './components/Video';
import Programs from './components/Programs';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <Navbar />
        <Hero />
        <About />
        <Video />
        <Programs />
        <Gallery />
        <Contact />
      </div>
    </LanguageProvider>
  );
}

export default App;