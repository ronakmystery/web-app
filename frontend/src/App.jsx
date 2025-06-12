import { Routes, Route } from 'react-router-dom';
import PianoVisualizer from './routes/PianoVisualizer.jsx';
import Home from './routes/Home.jsx';

import Test from './routes/Test.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/piano" element={<PianoVisualizer />} />
      <Route path="/test" element={<Test />} />
    </Routes>
  );
}

export default App;
