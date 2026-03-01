import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function Login({ onLogin, abrirMestre }: { onLogin: (data: any) => void; abrirMestre: () => void }) {
  const [identificador, setIdentificador] = useState("");

  const entrar = async () => {
    // Busca pelo codinome ou nome na tabela personagens
    const { data } = await supabase
      .from("personagens")
      .select("*")
      .or(`codinome.eq.${identificador},nome.eq.${identificador}`)
      .single();

    if (data) {
      onLogin(data);
    } else {
      alert("Personagem não encontrado. Verifique se digitou o codinome corretamente (ex: Brasil).");
    }
  };

  return (
    <div style={{ padding: 40, textAlign: 'center', backgroundColor: '#000', height: '100vh' }}>
      <h1 style={{ color: 'red', letterSpacing: '2px' }}>ORDEM PARANORMAL: HEXATOMBE</h1>
      <p style={{ color: '#666' }}>Manaus, 2002</p>

      <div style={{ marginTop: 50 }}>
        <input
          placeholder="Digite seu Codinome"
          value={identificador}
          onChange={(e) => setIdentificador(e.target.value)}
          style={{ padding: '10px', width: '250px', backgroundColor: '#222', color: '#fff', border: '1px solid #444' }}
        />
        <br /><br />
        <button onClick={entrar} style={{ padding: '10px 30px', backgroundColor: 'red', color: 'white', border: 'none', cursor: 'pointer' }}>
          ACESSAR FICHA
        </button>
      </div>

      <div style={{ marginTop: 100 }}>
        <button onClick={abrirMestre} style={{ backgroundColor: 'transparent', color: '#444', border: '1px solid #444', cursor: 'pointer' }}>
          MODO MESTRE
        </button>
      </div>
    </div>
  );
}