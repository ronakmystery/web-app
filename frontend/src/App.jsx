import { Routes, Route } from 'react-router-dom';
import PianoVisualizer from './routes/PianoVisualizer.jsx';
import Home from './routes/Home.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/piano" element={<PianoVisualizer />} />
    </Routes>
  );
}

export default App;
