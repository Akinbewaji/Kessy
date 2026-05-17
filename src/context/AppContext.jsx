import React, { createContext, useState, useEffect } from 'react';
import { GENRES } from '../data/genres';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [step, setStep] = useState(0); // 0 = landing
  const [genreId, setGenreId] = useState(() => {
    const saved = localStorage.getItem('kessy_genreId');
    return saved ? JSON.parse(saved) : null;
  });
  const [characters, setCharacters] = useState(() => {
    const saved = localStorage.getItem('kessy_characters');
    return saved ? JSON.parse(saved) : { maleName: '', femaleName: '', maleRole: '', femaleRole: '' };
  });
  const [plot, setPlot] = useState(() => {
    const saved = localStorage.getItem('kessy_plot');
    return saved ? JSON.parse(saved) : { trope: '', conflict: '', setting: '' };
  });
  const [outline, setOutline] = useState(() => {
    const saved = localStorage.getItem('kessy_outline');
    return saved ? JSON.parse(saved) : null;
  });
  const [coverUrl, setCoverUrl] = useState(() => {
    const saved = localStorage.getItem('kessy_coverUrl');
    return saved ? JSON.parse(saved) : null;
  });
  const [chapter, setChapter] = useState(() => {
    const saved = localStorage.getItem('kessy_chapter');
    return saved ? JSON.parse(saved) : '';
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kessy_genreId', JSON.stringify(genreId));
    localStorage.setItem('kessy_characters', JSON.stringify(characters));
    localStorage.setItem('kessy_plot', JSON.stringify(plot));
    localStorage.setItem('kessy_outline', JSON.stringify(outline));
    localStorage.setItem('kessy_coverUrl', JSON.stringify(coverUrl));
    localStorage.setItem('kessy_chapter', JSON.stringify(chapter));
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
    ['kessy_genreId', 'kessy_characters', 'kessy_plot', 'kessy_outline', 'kessy_coverUrl', 'kessy_chapter'].forEach(key => localStorage.removeItem(key));
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
