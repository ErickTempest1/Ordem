import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import SubordinadosPanel from "../components/SubordinadosPanel";
import BossPanel from "../components/BossPanel";

export default function Mestre() {
  const [jogadores, setJogadores] = useState<any[]>([]);
  const [bosses, setBosses] = useState<any[]>([]);
  const [subordinados, setSubordinados] = useState<any[]>([]);
  
  // Estado para rastrear quais Chefes estão em combate simultâneo
  const [chefesAtivos, setChefesAtivos] = useState<string[]>([]);

  const carregarTudo = async () => {
    const { data: resJog } = await supabase.from("personagens").select("*");
    const { data: resBoss } = await supabase.from("bosses").select("*");
    const { data: resSub } = await supabase.from("subordinados").select("*").order("grupo");

    setJogadores(resJog || []);
    setBosses(resBoss || []);
    setSubordinados(resSub || []);
  };

  useEffect(() => {
    carregarTudo();
    const interval = setInterval(carregarTudo, 5000);
    return () => clearInterval(interval);
  }, []);

  // Função para ativar/desativar a presença do Chefe na cena
  const toggleAura = (nomeChefe: string) => {
    if (chefesAtivos.includes(nomeChefe)) {
      setChefesAtivos(chefesAtivos.filter(c => c !== nomeChefe));
    } else {
      setChefesAtivos([...chefesAtivos, nomeChefe]);
    }
  };

  // MECÂNICA SECRETA: Se houver chefes cadastrados e todos estiverem com 0 PV, o Kian aparece!
  const todosDerrotados = bosses.length > 0 && bosses.every(b => b.pv_atual <= 0);

  if (todosDerrotados) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#0a0000', color: 'red', textAlign: 'center', padding: '20px' }}>
         <h1 style={{ fontSize: '4rem', textShadow: '0 0 30px red', margin: 0 }}>O SÉTIMO ELEMENTO DESPERTA</h1>
         <p style={{ fontSize: '1.5rem', fontStyle: 'italic', color: '#ccc', marginTop: '20px' }}>
           "Vocês acharam que as máscaras eram o fim... Elas eram apenas a chave." - Kian
         </p>
         <button 
           onClick={() => setBosses([])} // Apenas um reset visual temporário para sair da tela
           style={{ marginTop: '50px', padding: '15px 30px', background: 'transparent', border: '1px solid red', color: 'red', cursor: 'pointer', fontFamily: 'monospace', fontSize: '1.2rem' }}
         >
           [ DESLIGAR SIMULAÇÃO ]
         </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#050505', color: '#eee', minHeight: '100vh', position: 'relative' }}>
      
      {/* ⚠️ ALERTA DE DIZIMAÇÃO TOTAL ⚠️ */}
      {chefesAtivos.length >= 2 && (
        <div className="dizimacao-alerta">
          <h1 style={{ margin: 0, fontSize: '2rem', letterSpacing: '2px' }}>⚠️ COLAPSO DA REALIDADE DETECTADO ⚠️</h1>
          <p style={{ margin: '10px 0 0 0', fontSize: '1.2rem' }}>
            Auras de <span style={{color: 'gold'}}>{chefesAtivos.join(" e ")}</span> em conflito!<br/>
            <strong>EFEITO:</strong> Uso de Flashbacks e Rituais BLOQUEADOS!
          </p>
        </div>
      )}

      {/* Ajusta o padding do título se o alerta estiver aparecendo */}
      <h1 style={{ textAlign: 'center', color: 'red', fontSize: '2.5rem', paddingTop: chefesAtivos.length >= 2 ? '120px' : '0' }}>
        PAINEL DO MESTRE
      </h1>
      
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ borderBottom: '2px solid gold', paddingBottom: '10px' }}>⚔️ Chefes de Facção</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {bosses.map(b => {
            const isAtivo = chefesAtivos.includes(b.nome);
            return (
              <div key={b.id} style={{ 
                position: 'relative', 
                border: isAtivo ? '2px solid red' : '1px solid #333', 
                borderRadius: '8px', 
                padding: '10px',
                background: isAtivo ? 'rgba(50, 0, 0, 0.3)' : 'transparent',
                boxShadow: isAtivo ? '0 0 15px rgba(255, 0, 0, 0.2)' : 'none',
                transition: 'all 0.3s'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                  <span style={{ color: isAtivo ? 'red' : 'gray', fontSize: '12px', fontWeight: 'bold' }}>
                    {isAtivo ? '🔴 PRESENÇA ATIVA' : '⚫ AGUARDANDO'}
                  </span>
                  <button 
                    onClick={() => toggleAura(b.nome)}
                    style={{ 
                      background: isAtivo ? 'red' : '#222', 
                      color: isAtivo ? 'black' : '#888', 
                      border: '1px solid #444', 
                      padding: '5px 10px', 
                      borderRadius: '4px', 
                      cursor: 'pointer', 
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}
                  >
                    {isAtivo ? 'RETIRAR DO COMBATE' : 'INICIAR COMBATE'}
                  </button>
                </div>
                <BossPanel boss={b} atualizar={carregarTudo} />
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ borderBottom: '2px solid #4d79ff', paddingBottom: '10px' }}>👥 Status dos Agentes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
          {jogadores.map(j => (
            <div key={j.id} style={{ background: '#111', padding: '15px', borderRadius: '5px', borderLeft: '4px solid #4d79ff' }}>
              <h4 style={{ margin: 0, color: '#fff' }}>{j.codinome}</h4>
              <div style={{ fontSize: '13px', marginTop: '10px', color: '#aaa' }}>
                PV: <span style={{color: '#ff4d4d'}}>{j.pv_atual}/{j.pv_max}</span> | 
                SAN: <span style={{color: '#9933ff'}}>{j.san_atual}/{j.san_max}</span> | 
                PE: <span style={{color: '#4d79ff'}}>{j.pe_atual}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ borderBottom: '2px solid #ff4d4d', paddingBottom: '10px' }}>🏴 Facções Rivais</h2>
        <SubordinadosPanel lista={subordinados} atualizar={carregarTudo} />
      </section>

      {/* Estilos CSS Nativos do Componente */}
      <style>{`
        .dizimacao-alerta {
          background: rgba(180, 0, 0, 0.95);
          color: white;
          padding: 20px;
          position: fixed;
          top: 0; left: 0; width: 100%;
          text-align: center;
          z-index: 9999;
          box-shadow: 0 0 40px red;
          border-bottom: 3px solid #ff4a4a;
          animation: piscarAlerta 1.5s infinite alternate;
        }
        @keyframes piscarAlerta { 
          from { background: rgba(180, 0, 0, 0.95); text-shadow: 0 0 5px white; } 
          to { background: rgba(100, 0, 0, 0.95); text-shadow: 0 0 15px black; } 
        }
      `}</style>
    </div>
  );
}