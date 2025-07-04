import { Routes, Route } from 'react-router-dom';
import Piano from './routes/piano/Piano.jsx';
import Home from './routes/home/Home.jsx';
import Admin from './routes/admin/Admin.jsx';

import Test from './routes/test/Test.jsx';


import { useGlobal } from "./GlobalContext.jsx";


import { PianoProvider } from './routes/piano/PianoContext.jsx';


function App() {


  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route
        path="/piano"
        element={
          <PianoProvider>
            <Piano />
          </PianoProvider>
        }
      />

      <Route
        path="/admin" element={<Admin />} />


      <Route path="/test" element={<Test />} />
    </Routes>
  );
}

export default App;
