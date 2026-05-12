import React, { createContext, useState, useEffect } from 'react';
import { GENRES } from '../data/genres';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [step, setStep] = useState(0); // 0 = landing
  const [genreId, setGenreId] = useState(null);
  const [characters, setCharacters] = useState({
    maleName: '', femaleName: '', maleRole: '', femaleRole: ''
  });
  const [plot, setPlot] = useState({ trope: '', conflict: '', setting: '' });
  const [outline, setOutline] = useState(null);
  const [coverUrl, setCoverUrl] = useState(null);
  const [chapter, setChapter] = useState('');

  // Derived state
  const genre = GENRES.find((g) => g.id === genreId);

  // Update accent color dynamically
  useEffect(() => {
    if (genre) {
      document.documentElement.style.setProperty('--accent', genre.color);
    } else {
      document.documentElement.style.setProperty('--accent', '#8B5CF6'); // Default
    }
  }, [genre]);

  const resetApp = () => {
    setStep(0);
    setGenreId(null);
    setCharacters({ maleName: '', femaleName: '', maleRole: '', femaleRole: '' });
    setPlot({ trope: '', conflict: '', setting: '' });
    setOutline(null);
    setCoverUrl(null);
    setChapter('');
    localStorage.clear();
    document.documentElement.style.setProperty('--accent', '#8B5CF6');
  };

  const value = {
    step,
    setStep,
    genreId,
    setGenreId,
    genre,
    characters,
    setCharacters,
    plot,
    setPlot,
    outline,
    setOutline,
    coverUrl,
    setCoverUrl,
    chapter,
    setChapter,
    resetApp
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
