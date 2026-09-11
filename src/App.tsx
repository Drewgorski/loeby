import { useEffect } from 'react';
import { NavLink, Route, Routes } from 'react-router-dom';
import { ensureState } from './db/db';
import { IconLearn, IconLibrary, IconProgress, IconToday, IconWhy } from './components/icons';
import Today from './pages/Today';
import Progress from './pages/Progress';
import Library from './pages/Library';
import Learn from './pages/Learn';
import Why from './pages/Why';

const NAV = [
  { to: '/', label: 'Today', Icon: IconToday, end: true },
  { to: '/progress', label: 'Progress', Icon: IconProgress, end: false },
  { to: '/library', label: 'Library', Icon: IconLibrary, end: false },
  { to: '/learn', label: 'Learn', Icon: IconLearn, end: false },
  { to: '/why', label: 'Why', Icon: IconWhy, end: false },
];

export default function App() {
  // ensureState() is a module-level singleton, so StrictMode's double-invoke
  // awaits the same promise and can't create the row twice.
  useEffect(() => {
    ensureState().catch((e) => console.error('State init failed:', e));
  }, []);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">The Loeby Program</div>
        {NAV.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="nav-link">
            <Icon />
            {label}
          </NavLink>
        ))}
      </aside>

      <main className="main">
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/library" element={<Library />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/why" element={<Why />} />
        </Routes>
      </main>

      <nav className="tabbar">
        {NAV.map(({ to, label, Icon, end }) => (
          <NavLink key={to} to={to} end={end}>
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
