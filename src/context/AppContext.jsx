import React, { createContext, useState, useEffect } from 'react';
import { GENRES } from '../data/genres';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [step, setStep] = useState(0); // 0 = landing
  const [genreId, setGenreId] = useState(() => JSON.parse(localStorage.getItem('genreId')) || null);
  const [characters, setCharacters] = useState(() => JSON.parse(localStorage.getItem('characters')) || {
    maleName: '', femaleName: '', maleRole: '', femaleRole: ''
  });
  const [plot, setPlot] = useState(() => JSON.parse(localStorage.getItem('plot')) || { trope: '', conflict: '', setting: '' });
  const [outline, setOutline] = useState(() => JSON.parse(localStorage.getItem('outline')) || null);
  const [coverUrl, setCoverUrl] = useState(() => JSON.parse(localStorage.getItem('coverUrl')) || null);
  const [chapter, setChapter] = useState(() => JSON.parse(localStorage.getItem('chapter')) || '');

  useEffect(() => {
    localStorage.setItem('genreId', JSON.stringify(genreId));
    localStorage.setItem('characters', JSON.stringify(characters));
    localStorage.setItem('plot', JSON.stringify(plot));
    localStorage.setItem('outline', JSON.stringify(outline));
    localStorage.setItem('coverUrl', JSON.stringify(coverUrl));
    localStorage.setItem('chapter', JSON.stringify(chapter));
  }, [genreId, characters, plot, outline, coverUrl, chapter]);

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
