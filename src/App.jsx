import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Particles from './components/Particles';
import Nav from './components/Nav';
import StepLanding from './components/StepLanding';
import StepGenre from './components/StepGenre';
import StepCharacters from './components/StepCharacters';
import StepPlot from './components/StepPlot';
import StepOutline from './components/StepOutline';
import StepCover from './components/StepCover';
import StepWrite from './components/StepWrite';

// Layout component to include Nav
function AppLayout({ children }) {
  return (
    <div id="app" className="animate-in">
      <Nav />
      <div id="main">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Particles />
      <Routes>
        <Route path="/" element={<StepLanding />} />
        <Route path="/genre" element={<AppLayout><StepGenre /></AppLayout>} />
        <Route path="/characters" element={<AppLayout><StepCharacters /></AppLayout>} />
        <Route path="/plot" element={<AppLayout><StepPlot /></AppLayout>} />
        <Route path="/outline" element={<AppLayout><StepOutline /></AppLayout>} />
        <Route path="/cover" element={<AppLayout><StepCover /></AppLayout>} />
        <Route path="/write" element={<AppLayout><StepWrite /></AppLayout>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
