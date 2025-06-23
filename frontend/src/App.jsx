import { Routes, Route } from 'react-router-dom';
import Piano from './routes/piano/Piano.jsx';
import Home from './routes/home/Home.jsx';

import Test from './routes/test/Test.jsx';


import { useGlobal } from "./GlobalContext.jsx";


import { PianoProvider } from './routes/piano/PianoContext.jsx';


function App() {

  const { user } = useGlobal();
  console.log(user)
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


      <Route path="/test" element={<Test />} />
    </Routes>
  );
}

export default App;
