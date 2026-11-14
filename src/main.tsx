import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initPerfMode } from './lib/perfMode';

initPerfMode();

createRoot(document.getElementById('root')!).render(<App />);
