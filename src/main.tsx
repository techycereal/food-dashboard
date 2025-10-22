import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import Offers from './page/Offers.tsx';
import { store } from './app/store.ts';
import { Provider } from 'react-redux';
import SignIn from './page/SignIn.tsx';
import AuthForm from './page/SignUp.tsx';
import ReportsChart from './page/Reports.tsx';
import Settings from './page/Settings.tsx';
createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
<StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
        </Route>
        <Route path="/offers" element={<Offers />}></Route>
        <Route path="/signin" element={<SignIn />}></Route>
        <Route path="/signup" element={<AuthForm />}></Route>
        <Route path="/reports" element={<ReportsChart />}></Route>
        <Route path="/settings" element={<Settings />}></Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
  </Provider>
);
