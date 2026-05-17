import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import Particles from './components/Particles';
import MainNavbar from './components/MainNavbar';
import Footer from './components/Footer';
import ToolStepper from './components/ToolStepper';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './components/pages/Home';
import Services from './components/pages/Services';
import Course from './components/pages/Course';
import Contact from './components/pages/Contact';
import Login from './components/pages/Login';
import Signup from './components/pages/Signup';
import Pricing from './components/pages/Pricing';
import Library from './components/pages/Library';
import BookEditor from './components/pages/BookEditor';
import Profile from './components/pages/Profile';

// AI Writer Tool Steps
import StepLanding from './components/StepLanding';
import StepGenre from './components/StepGenre';
import StepCharacters from './components/StepCharacters';
import StepPlot from './components/StepPlot';
import StepOutline from './components/StepOutline';
import StepCover from './components/StepCover';
import StepWrite from './components/StepWrite';

// Base Layout for all pages
function RootLayout() {
  return (
    <div id="app" className="animate-in">
      <MainNavbar />
      <div id="main" style={{ minHeight: '80vh' }}>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

// Layout specific to the Writer tool to include the stepper
function WriterLayout() {
  return (
    <>
      <ToolStepper />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Particles />
      <Routes>
        {/* Global Root Layout wraps everything */}
        <Route element={<RootLayout />}>
          
          {/* Public Brand Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/course" element={<Course />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Protected Library Pages */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/library" element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          } />
          <Route path="/library/:id" element={
            <ProtectedRoute>
              <BookEditor />
            </ProtectedRoute>
          } />

          {/* Protected AI Writer Hub */}
          <Route path="/writer" element={
            <ProtectedRoute>
              <WriterLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StepLanding />} />
            <Route path="genre" element={<StepGenre />} />
            <Route path="characters" element={<StepCharacters />} />
            <Route path="plot" element={<StepPlot />} />
            <Route path="outline" element={<StepOutline />} />
            <Route path="cover" element={<StepCover />} />
            <Route path="write" element={<StepWrite />} />
          </Route>

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
