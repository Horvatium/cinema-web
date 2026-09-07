import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Vstopna točka spletne aplikacije: React se priklopi na element #root
// iz public/index.html. StrictMode je razvojni pripomoček, ki opozarja na
// zastarele vzorce in v razvoju komponente izriše dvakrat.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);