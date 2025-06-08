import './App.css';
import Topbar from './layout/Topbar'
import Main from './layout/Main'
import AuthProvider from './context/AuthContext';

export default function App() {
  return (
    <div>
      <AuthProvider>
        <Topbar />
        <Main />
      </AuthProvider>
    </div>
  );
}