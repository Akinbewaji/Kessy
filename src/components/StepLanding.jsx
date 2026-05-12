import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';

export default function StepLanding() {
  const { setStep } = useContext(AppContext);
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/writer/genre');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div id="landing">
      <p className="eyebrow dk-body">✦ DIGITAL KESSY PRESENTS ✦</p>
      <h1 className="big dk-title">
        Ghostwriting<span>Studio</span>
      </h1>
      <div className="divider"></div>
      <p className="tagline">
        Your AI-powered dark romance writing companion.<br />
        From idea to chapter — step by step.
      </p>
      <button className="btn-main dk-body" onClick={handleStart}>
        BEGIN YOUR STORY
      </button>
      <p className="subline dk-body">Werewolf · Billionaire · Mafia</p>
    </div>
  );
}
