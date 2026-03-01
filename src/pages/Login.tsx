import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Login({ onLogin, abrirMestre }: any) {
  const [nomeDigitado, setNomeDigitado] = useState('');
  
  // Novos estados para a segurança do Mestre
  const [pedindoSenha, setPedindoSenha] = useState(false);
  const [senhaDigitada, setSenhaDigitada] = useState('');

  const handleEntrar = async () => {
    if (!nomeDigitado) return;
    
    // Busca o personagem ignorando maiúsculas/minúsculas
    const { data, error } = await supabase
      .from('personagens')
      .select('*')
      .ilike('codinome', nomeDigitado.trim())
      .single();

    if (error || !data) {
      alert('Personagem não encontrado. Verifique se digitou o codinome corretamente (ex: Brasil).');
    } else {
      onLogin(data);
    }
  };

  const handleMestre = () => {
    // 🔐 AQUI FICA A SUA SENHA DE MESTRE! Pode alterar para o que quiser:
    const SENHA_SECRETA = "E27I23"; 

    if (senhaDigitada === SENHA_SECRETA) {
      abrirMestre();
    } else {
      alert("⚠️ ACESSO NEGADO. Você não tem autorização da Ordo Realitas.");
      setSenhaDigitada('');
      setPedindoSenha(false); // Fecha o painel de senha após o erro
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%', backgroundColor: '#000', fontFamily: 'monospace', padding: '20px' }}>
      
      {/* TÍTULO */}
      <h1 style={{ color: '#cc0000', fontSize: '2.2rem', letterSpacing: '4px', textAlign: 'center', textShadow: '2px 2px 10px rgba(200,0,0,0.3)', margin: '0 0 10px 0' }}>
        ORDEM PARANORMAL: HEXATOMBE
      </h1>
      <p style={{ color: '#555', marginBottom: '50px', letterSpacing: '2px', fontSize: '14px' }}>Manaus, 2002</p>

      {/* LOGIN DOS JOGADORES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '300px' }}>
        <input 
          type="text" 
          placeholder="Digite seu Codinome" 
          value={nomeDigitado}
          onChange={(e) => setNomeDigitado(e.target.value)}
          style={{ padding: '12px', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '5px', textAlign: 'center', outline: 'none', fontSize: '14px' }}
          onKeyDown={(e) => e.key === 'Enter' && handleEntrar()}
        />
        <button 
          onClick={handleEntrar}
          style={{ padding: '12px', background: '#cc0000', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px', transition: '0.3s' }}>
          ACESSAR FICHA
        </button>
      </div>

      {/* SESSÃO SECRETA DO MESTRE */}
      <div style={{ marginTop: '60px', width: '100%', maxWidth: '300px' }}>
        {!pedindoSenha ? (
          <button 
            onClick={() => setPedindoSenha(true)}
            style={{ width: '100%', padding: '10px', background: 'transparent', color: '#444', border: '1px solid #222', borderRadius: '5px', cursor: 'pointer', letterSpacing: '1px', transition: '0.3s' }}>
            MODO MESTRE
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', animation: 'fadeIn 0.3s ease' }}>
            <input 
              type="password" 
              placeholder="Senha de Acesso" 
              value={senhaDigitada}
              onChange={(e) => setSenhaDigitada(e.target.value)}
              style={{ padding: '10px', background: '#1a0000', border: '1px solid #ff0000', color: '#ff4d4d', borderRadius: '5px', textAlign: 'center', outline: 'none', fontSize: '14px', letterSpacing: '2px' }}
              onKeyDown={(e) => e.key === 'Enter' && handleMestre()}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setPedindoSenha(false)}
                style={{ flex: 1, padding: '10px', background: '#222', color: '#888', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                CANCELAR
              </button>
              <button 
                onClick={handleMestre}
                style={{ flex: 1, padding: '10px', background: '#500', color: '#fff', border: '1px solid red', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', boxShadow: '0 0 10px rgba(255,0,0,0.5)' }}>
                ENTRAR
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}