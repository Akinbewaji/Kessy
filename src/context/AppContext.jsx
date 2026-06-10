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
  const [chapters, setChapters] = useState({});

  // New Dark Romance Settings
  const [darknessLevel, setDarknessLevel] = useState(() => {
    const saved = localStorage.getItem('kessy_darknessLevel');
    return saved ? JSON.parse(saved) : 3;
  });
  const [heatLevel, setHeatLevel] = useState(() => {
    const saved = localStorage.getItem('kessy_heatLevel');
    return saved ? JSON.parse(saved) : 3;
  });
  const [possessivenessLevel, setPossessivenessLevel] = useState(() => {
    const saved = localStorage.getItem('kessy_possessivenessLevel');
    return saved ? JSON.parse(saved) : 3;
  });
  const [heaGuarantee, setHeaGuarantee] = useState(() => {
    const saved = localStorage.getItem('kessy_heaGuarantee');
    return saved ? JSON.parse(saved) : 'HEA'; // HEA, HFN, or Tragic
  });
  const [dualPov, setDualPov] = useState(() => {
    const saved = localStorage.getItem('kessy_dualPov');
    return saved ? JSON.parse(saved) : false;
  });
  const [chapterCount, setChapterCount] = useState(() => {
    const saved = localStorage.getItem('kessy_chapterCount');
    return saved ? JSON.parse(saved) : 10;
  });
  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('kessy_genreId', JSON.stringify(genreId));
    localStorage.setItem('kessy_characters', JSON.stringify(characters));
    localStorage.setItem('kessy_plot', JSON.stringify(plot));
    localStorage.setItem('kessy_outline', JSON.stringify(outline));
    localStorage.setItem('kessy_coverUrl', JSON.stringify(coverUrl));
    localStorage.setItem('kessy_darknessLevel', JSON.stringify(darknessLevel));
    localStorage.setItem('kessy_heatLevel', JSON.stringify(heatLevel));
    localStorage.setItem('kessy_possessivenessLevel', JSON.stringify(possessivenessLevel));
    localStorage.setItem('kessy_heaGuarantee', JSON.stringify(heaGuarantee));
    localStorage.setItem('kessy_dualPov', JSON.stringify(dualPov));
    localStorage.setItem('kessy_chapterCount', JSON.stringify(chapterCount));
  }, [genreId, characters, plot, outline, coverUrl, darknessLevel, heatLevel, possessivenessLevel, heaGuarantee, dualPov, chapterCount]);

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
    setChapters({});
    setDarknessLevel(3);
    setHeatLevel(3);
    setPossessivenessLevel(3);
    setHeaGuarantee('HEA');
    setDualPov(false);
    setChapterCount(10);
    ['kessy_genreId', 'kessy_characters', 'kessy_plot', 'kessy_outline', 'kessy_coverUrl', 'kessy_chapters', 'kessy_darknessLevel', 'kessy_heatLevel', 'kessy_possessivenessLevel', 'kessy_heaGuarantee', 'kessy_dualPov', 'kessy_chapterCount'].forEach(key => localStorage.removeItem(key));
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
    chapters,
    setChapters,
    darknessLevel,
    setDarknessLevel,
    heatLevel,
    setHeatLevel,
    possessivenessLevel,
    setPossessivenessLevel,
    heaGuarantee,
    setHeaGuarantee,
    dualPov,
    setDualPov,
    chapterCount,
    setChapterCount,
    resetApp
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
