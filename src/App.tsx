import { useState } from 'react';
import Login from './pages/Login';
import Ficha from './pages/Ficha';
import Mestre from './pages/Mestre';
import './App.css';

function App() {
  const [tela, setTela] = useState('login');
  const [user, setUser] = useState(null);

  const handleLogin = (personagem: any) => {
    setUser(personagem);
    setTela('ficha');
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#000',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center', /* A Mágica! Puxa tudo pro meio da tela */
      overflowX: 'hidden'
    }}>
      
      {/* Contêiner limitador: impede que o site estique ao infinito em telas grandes */}
      <div style={{ width: '100%', maxWidth: '1400px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {tela === 'login' && (
          <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Login onLogin={handleLogin} abrirMestre={() => setTela('mestre')} />
            </div>
          </div>
        )}

        {tela === 'ficha' && user && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button 
              onClick={() => setTela('login')} 
              style={{ margin: '20px', padding: '10px 20px', background: '#111', color: '#ff4d4d', border: '1px solid #ff4d4d', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold', letterSpacing: '1px' }}>
              SAIR / TROCAR PERSONAGEM
            </button>
            <Ficha player={user} />
          </div>
        )}

        {tela === 'mestre' && (
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <button 
                onClick={() => setTela('login')} 
                style={{ padding: '10px 20px', background: '#111', color: 'gold', border: '1px solid gold', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold', letterSpacing: '1px' }}>
                VOLTAR AO MENU INICIAL
              </button>
            </div>
            <Mestre />
          </div>
        )}

      </div>
    </div>
  );
}

export default App;