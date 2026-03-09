import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Components/i18n';
import Aos from "aos";
import './index.css'
import App from './App.jsx'

import { Provider } from 'react-redux';
import { store } from './redux/store';

Aos.init({ duration: 1500, once: true });
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
