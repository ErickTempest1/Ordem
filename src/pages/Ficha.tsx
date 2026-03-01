import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Ficha({ player }: { player: any }) {
  const [personagem, setPersonagem] = useState(player);
  const [mascaraAtiva, setMascaraAtiva] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('habilidades');

  const atualizar = async () => {
    const { data } = await supabase.from("personagens").select("*").eq("id", personagem.id).single();
    if (data) setPersonagem(data);
  };

  useEffect(() => {
    const interval = setInterval(atualizar, 3000);
    return () => clearInterval(interval);
  }, []);

  const getAtributo = (val: number) => mascaraAtiva ? val + 1 : val;
  const pvMaximoCalculado = mascaraAtiva ? personagem.pv_max + 25 : personagem.pv_max;
  const peMaximoCalculado = mascaraAtiva ? personagem.pe_max + 10 : personagem.pe_max;

  const alterarStatus = async (tipo: 'pv_atual' | 'pe_atual' | 'san_atual', valor: number) => {
    const maximo = tipo === 'pv_atual' ? pvMaximoCalculado : (tipo === 'pe_atual' ? peMaximoCalculado : personagem.san_max);
    const novoValor = Math.min(maximo, Math.max(0, personagem[tipo] + valor));
    
    setPersonagem((prev: any) => ({ ...prev, [tipo]: novoValor }));
    await supabase.from("personagens").update({ [tipo]: novoValor }).eq("id", personagem.id);
  };

  const habilidadesAtuais = mascaraAtiva ? personagem.habilidades_mascara : personagem.habilidades_base;
  const temRituais = personagem.rituais && personagem.rituais.length > 0;

  const ControleVital = ({ label, atual, max, color, tipo }: any) => (
    <div style={{ marginBottom: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color, fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>
        <span>{label}</span>
        <span>{atual} / {max}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button onClick={() => alterarStatus(tipo, -5)} style={{ background: '#400', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>-5</button>
        <button onClick={() => alterarStatus(tipo, -1)} style={{ background: '#200', color: '#ff4d4d', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>-1</button>
        
        <div style={{ flex: 1, background: '#222', height: '12px', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ width: `${(atual / max) * 100}%`, background: color, height: '100%', transition: 'width 0.3s' }}></div>
        </div>
        
        <button onClick={() => alterarStatus(tipo, 1)} style={{ background: '#020', color: '#4caf50', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>+1</button>
        <button onClick={() => alterarStatus(tipo, 5)} style={{ background: '#040', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+5</button>
      </div>
    </div>
  );

  return (
    <div className={`ficha-container ${mascaraAtiva ? 'modo-persona' : ''}`}>
      
      <button className="btn-mascara" onClick={() => setMascaraAtiva(!mascaraAtiva)}>
        {mascaraAtiva 
          ? "🎭 MODO ASSASSINO ATIVO (CLIQUE PARA REPRIMIR)" 
          : `👺 USAR GATILHO: ${personagem.gatilho?.toUpperCase()}`}
      </button>

      {mascaraAtiva && (
        <div style={{ background: '#300', border: '1px solid red', padding: '10px', borderRadius: '4px', marginBottom: '20px', textAlign: 'center', color: '#ff4d4d', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>
          ⚠️ IMUNIDADE A MEDO ATIVADA | DRENO: -1 SANIDADE POR RODADA ⚠️
        </div>
      )}

      <header style={{ borderBottom: mascaraAtiva ? '1px solid red' : '1px solid #333', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1 style={{ color: mascaraAtiva ? "red" : "white", margin: 0, fontSize: '2.5rem', textTransform: 'uppercase' }}>
          {mascaraAtiva ? personagem.codinome_persona : personagem.codinome}
        </h1>
        <div style={{ color: "#666", textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between' }}>
          <span>{personagem.nome} | {personagem.ocupacao}</span>
          <span style={{ color: 'gold' }}>NEX: {personagem.nex}%</span>
        </div>
        {mascaraAtiva && (
          <div style={{ marginTop: '10px', fontStyle: 'italic', color: '#aaa', borderLeft: '3px solid red', paddingLeft: '10px' }}>
            "{personagem.psicologia_mascara.split('Frase: ')[1]?.replace('"', '') || personagem.psicologia_mascara}"
          </div>
        )}
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px', margin: '20px 0' }}>
        {['FOR', 'AGI', 'INT', 'VIG', 'PRE'].map((attr) => {
          const key = attr.toLowerCase() === 'for' ? 'forca' : attr.toLowerCase() === 'agi' ? 'agilidade' : attr.toLowerCase() === 'int' ? 'intelecto' : attr.toLowerCase() === 'vig' ? 'vigor' : 'presenca';
          return (
            <div key={attr} style={{ background: mascaraAtiva ? '#300' : '#1a1a1a', padding: '10px', borderRadius: '4px', textAlign: 'center', border: mascaraAtiva ? '1px solid red' : '1px solid #222' }}>
              <div style={{ fontSize: '10px', color: mascaraAtiva ? '#ff4d4d' : 'gray' }}>{attr}</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: mascaraAtiva ? 'white' : '#ddd' }}>
                {getAtributo(personagem[key])}
              </div>
            </div>
          );
        })}
        <div style={{ background: '#111', padding: '10px', borderRadius: '4px', textAlign: 'center', border: '1px solid #444' }}>
          <div style={{ fontSize: '10px', color: '#4d79ff' }}>DEFESA</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'white' }}>{personagem.defesa}</div>
        </div>
      </div>

      <div style={{ background: mascaraAtiva ? '#110000' : '#111', padding: '20px', borderRadius: '8px', border: mascaraAtiva ? '1px solid #400' : 'none' }}>
        <ControleVital label="PONTOS DE VIDA (PV)" atual={personagem.pv_atual} max={pvMaximoCalculado} color="#ff4d4d" tipo="pv_atual" />
        <ControleVital label="PONTOS DE ESFORÇO (PE)" atual={personagem.pe_atual} max={peMaximoCalculado} color="#4d79ff" tipo="pe_atual" />
        <ControleVital label="SANIDADE (SAN)" atual={personagem.san_atual} max={personagem.san_max} color="#9933ff" tipo="san_atual" />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '30px', borderBottom: '1px solid #333', paddingBottom: '10px', overflowX: 'auto' }}>
        <button className={`aba-btn ${abaAtiva === 'habilidades' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('habilidades')}>⚔️ HABILIDADES</button>
        {temRituais && (
          <button className={`aba-btn ${abaAtiva === 'rituais' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('rituais')}>📖 RITUAIS</button>
        )}
        <button className={`aba-btn ${abaAtiva === 'pericias' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('pericias')}>🎯 PERÍCIAS</button>
        <button className={`aba-btn ${abaAtiva === 'inventario' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('inventario')}>🎒 MOCHILA</button>
        <button className={`aba-btn ${abaAtiva === 'flashback' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('flashback')}>🎞️ FLASHBACK</button>
      </div>

      <div style={{ marginTop: '20px', minHeight: '200px' }}>
        
        {abaAtiva === 'habilidades' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {habilidadesAtuais?.map((hab: any, index: number) => (
              <div key={index} style={{ background: mascaraAtiva ? '#2a0000' : '#222', padding: '12px', borderRadius: '5px', borderLeft: mascaraAtiva ? '4px solid red' : '4px solid gold' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <strong style={{ color: mascaraAtiva ? '#ff4d4d' : '#fff' }}>{hab.nome}</strong>
                  <span style={{ fontSize: '12px', color: '#888', background: '#000', padding: '2px 6px', borderRadius: '4px' }}>{hab.custo}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#ccc' }}>{hab.efeito}</div>
              </div>
            ))}
          </div>
        )}

        {abaAtiva === 'rituais' && temRituais && (
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {personagem.rituais?.map((ritual: any, index: number) => (
                <div key={index} style={{ background: '#111', padding: '12px', borderRadius: '5px', borderLeft: '4px solid #9933ff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong style={{ color: '#c299ff' }}>{ritual.nome}</strong>
                    <span style={{ fontSize: '12px', color: '#888', background: '#000', padding: '2px 6px', borderRadius: '4px' }}>{ritual.custo}</span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#ccc' }}>{ritual.efeito}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'pericias' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {personagem.pericias?.map((pericia: string, index: number) => (
              <div key={index} style={{ background: '#1a1a1a', padding: '10px 15px', borderRadius: '4px', border: '1px solid #333', color: '#00ffcc', fontFamily: 'monospace', fontSize: '14px' }}>
                {pericia}
              </div>
            ))}
          </div>
        )}

        {abaAtiva === 'inventario' && (
          <ul style={{ background: '#111', padding: '20px 40px', borderRadius: '8px', border: '1px solid #333', color: '#ccc', lineHeight: '1.8' }}>
            {personagem.inventario?.map((item: string, index: number) => (
              <li key={index} style={{ marginBottom: '8px' }}>
                <strong>{item.split('(')[0]}</strong> {item.includes('(') ? `(${item.split('(')[1]}` : ''}
              </li>
            ))}
          </ul>
        )}

        {/* --- NOVA ABA DE FLASHBACK --- */}
        {abaAtiva === 'flashback' && (
          <div style={{ background: '#111', padding: '20px', borderRadius: '8px', border: '1px solid #333' }}>
            <h3 style={{ color: 'gold', marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '10px' }}>🎞️ CENA DE FLASHBACK</h3>
            <p style={{ fontSize: '13px', color: '#ccc', lineHeight: '1.6' }}>
              Declare que seu personagem previu essa situação e se preparou no passado. O Mestre aprovará o custo baseado na complexidade da sua ideia.
            </p>
            
            {personagem.codinome === 'Itália' && (
              <div style={{ background: '#332200', padding: '8px', borderRadius: '4px', color: 'gold', fontSize: '12px', marginBottom: '15px', borderLeft: '3px solid gold' }}>
                <strong>Vantagem (Famiglia):</strong> Você reduz em -1 PE o custo de qualquer Flashback social ou de contatos!
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: '12px', borderRadius: '5px', borderLeft: '3px solid #4caf50' }}>
                <div>
                  <strong style={{ color: 'white', fontSize: '14px' }}>Ação Simples</strong>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Ex: Esconder uma arma na sala, deixar a porta destrancada.</div>
                </div>
                <button onClick={() => alterarStatus('pe_atual', -1)} style={{ background: '#4caf50', color: 'black', border: 'none', padding: '8px 15px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>GASTAR 1 PE</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: '12px', borderRadius: '5px', borderLeft: '3px solid #ffcc00' }}>
                <div>
                  <strong style={{ color: 'white', fontSize: '14px' }}>Ação Complexa</strong>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Ex: Plantar explosivos C4 na fundação, subornar o chefe da segurança.</div>
                </div>
                <button onClick={() => alterarStatus('pe_atual', -3)} style={{ background: '#ffcc00', color: 'black', border: 'none', padding: '8px 15px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>GASTAR 3 PE</button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: '12px', borderRadius: '5px', borderLeft: '3px solid #ff4d4d' }}>
                <div>
                  <strong style={{ color: 'white', fontSize: '14px' }}>Ação Improvável</strong>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>Ex: Hackear o sistema central dias antes, ter uma rota de fuga de helicóptero.</div>
                </div>
                <button onClick={() => alterarStatus('pe_atual', -6)} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>GASTAR 6 PE</button>
              </div>

            </div>
          </div>
        )}

      </div>

      <style>{`
        .ficha-container { transition: all 0.5s ease; padding: 30px; max-width: 700px; margin: 40px auto; background: #0d0d0d; box-shadow: 0 0 20px rgba(0,0,0,0.8); border-radius: 8px; border: 1px solid #333; }
        .modo-persona { background: #0a0000; box-shadow: 0 0 40px rgba(255,0,0,0.3); border: 1px solid red; }
        .btn-mascara { 
          width: 100%; padding: 15px; margin-bottom: 20px;
          background: #111; color: #888; border: 1px dashed #555;
          cursor: pointer; font-family: monospace; font-size: 1rem; font-weight: bold;
          transition: all 0.3s;
        }
        .modo-persona .btn-mascara { background: red; color: black; border: 2px solid #ff4d4d; box-shadow: 0 0 15px red; animation: pulse 2s infinite; }
        .aba-btn {
          background: transparent; color: #666; border: none; padding: 10px 15px; cursor: pointer;
          font-family: 'Courier New', Courier, monospace; font-weight: bold; font-size: 14px;
          border-bottom: 2px solid transparent; transition: 0.3s; white-space: nowrap;
        }
        .aba-btn:hover { color: #fff; }
        .aba-btn.ativa { color: gold; border-bottom: 2px solid gold; }
        .modo-persona .aba-btn.ativa { color: red; border-bottom: 2px solid red; }
        @keyframes pulse {
          0% { box-shadow: 0 0 10px red; }
          50% { box-shadow: 0 0 25px red; }
          100% { box-shadow: 0 0 10px red; }
        }
      `}</style>
    </div>
  );
}