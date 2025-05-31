import { useState, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
const AuthForm   = lazy(() => import('./component/FormAuth'));
const SearchPage = lazy(() => import('./component/PageSearch'));

function App() {
  // https://react.dev/reference/react/useState#usestate
  const [authenticated, setAuthenticated] = useState(false);
  const phoneNumber = localStorage.getItem('phoneNumber');

  const theElement = authenticated || phoneNumber ?
  (
    <SearchPage phoneNumber={phoneNumber} />
  ) : (
    <AuthForm setAuthenticated={setAuthenticated} />
  );

// https://reactrouter.com/start/declarative/routing
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={theElement}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
