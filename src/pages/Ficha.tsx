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

  // COMPONENTE DE BARRA INTERATIVA RESPONSIVA
  const ControleVital = ({ label, atual, max, color, tipo }: any) => (
    <div style={{ marginBottom: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color, fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>
        <span>{label}</span>
        <span>{atual} / {max}</span>
      </div>
      
      {/* Container dos controles (Muda de Flex para Grid no mobile via CSS global se necessário, mas aqui vamos manter flex limpo) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '100%', flexWrap: 'nowrap' }}>
        <button onClick={() => alterarStatus(tipo, -5)} style={{ flex: '0 0 auto', background: '#400', color: 'white', border: 'none', padding: '8px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>-5</button>
        
        <div style={{ flex: '1 1 auto', background: '#222', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{ width: `${(atual / max) * 100}%`, background: color, height: '100%', transition: 'width 0.3s' }}></div>
        </div>
        
        <button onClick={() => alterarStatus(tipo, 5)} style={{ flex: '0 0 auto', background: '#040', color: 'white', border: 'none', padding: '8px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>+5</button>
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
        <div style={{ background: '#300', border: '1px solid red', padding: '10px', borderRadius: '4px', marginBottom: '15px', textAlign: 'center', color: '#ff4d4d', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>
          ⚠️ DRENO: -1 SANIDADE POR RODADA ⚠️
        </div>
      )}

      <header style={{ borderBottom: mascaraAtiva ? '1px solid red' : '1px solid #333', paddingBottom: '10px', marginBottom: '15px' }}>
        <h1 style={{ color: mascaraAtiva ? "red" : "white", margin: 0, fontSize: '2.2rem', textTransform: 'uppercase', textAlign: 'center' }}>
          {mascaraAtiva ? personagem.codinome_persona : personagem.codinome}
        </h1>
        <div style={{ color: "#888", textTransform: 'uppercase', display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '5px' }}>
          <span>{personagem.ocupacao}</span>
          <span style={{ color: 'gold' }}>NEX: {personagem.nex}%</span>
        </div>
        {mascaraAtiva && (
          <div style={{ marginTop: '10px', fontStyle: 'italic', color: '#aaa', borderLeft: '3px solid red', paddingLeft: '10px', fontSize: '12px' }}>
            "{personagem.psicologia_mascara.split('Frase: ')[1]?.replace('"', '') || personagem.psicologia_mascara}"
          </div>
        )}
      </header>

      {/* --- GRID DE ATRIBUTOS RESPONSIVO --- */}
      {/* Usamos a classe CSS definida no style tag abaixo */}
      <div className="grid-atributos">
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

      <div style={{ background: mascaraAtiva ? '#110000' : '#111', padding: '15px', borderRadius: '8px', border: mascaraAtiva ? '1px solid #400' : 'none' }}>
        <ControleVital label="PONTOS DE VIDA (PV)" atual={personagem.pv_atual} max={pvMaximoCalculado} color="#ff4d4d" tipo="pv_atual" />
        <ControleVital label="PONTOS DE ESFORÇO (PE)" atual={personagem.pe_atual} max={peMaximoCalculado} color="#4d79ff" tipo="pe_atual" />
        <ControleVital label="SANIDADE (SAN)" atual={personagem.san_atual} max={personagem.san_max} color="#9933ff" tipo="san_atual" />
      </div>

      {/* --- NAVEGAÇÃO DE ABAS RESPONSIVA --- */}
      {/* overflowX permite scrollar horizontalmente se o celular for muito estreito */}
      <div style={{ display: 'flex', gap: '5px', marginTop: '20px', borderBottom: '1px solid #333', paddingBottom: '8px', overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
        <button className={`aba-btn ${abaAtiva === 'habilidades' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('habilidades')}>⚔️ HABS</button>
        {temRituais && <button className={`aba-btn ${abaAtiva === 'rituais' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('rituais')}>📖 RITUAIS</button>}
        <button className={`aba-btn ${abaAtiva === 'pericias' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('pericias')}>🎯 PERÍCIAS</button>
        <button className={`aba-btn ${abaAtiva === 'inventario' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('inventario')}>🎒 MOCHILA</button>
        <button className={`aba-btn ${abaAtiva === 'flashback' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('flashback')}>🎞️ FLASH</button>
      </div>

      <div style={{ marginTop: '15px', minHeight: '180px', fontSize: '13px' }}>
        {/* Habilidades */}
        {abaAtiva === 'habilidades' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {habilidadesAtuais?.map((hab: any, index: number) => (
              <div key={index} style={{ background: mascaraAtiva ? '#2a0000' : '#222', padding: '10px', borderRadius: '5px', borderLeft: mascaraAtiva ? '3px solid red' : '3px solid gold' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: mascaraAtiva ? '#ff4d4d' : '#fff' }}>{hab.nome}</strong>
                  <span style={{ fontSize: '11px', color: '#888', background: '#000', padding: '2px 5px', borderRadius: '4px' }}>{hab.custo}</span>
                </div>
                <div style={{ color: '#ccc', fontSize: '12px' }}>{hab.efeito}</div>
              </div>
            ))}
          </div>
        )}

        {/* Rituais */}
        {abaAtiva === 'rituais' && temRituais && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {personagem.rituais?.map((ritual: any, index: number) => (
              <div key={index} style={{ background: '#111', padding: '10px', borderRadius: '5px', borderLeft: '3px solid #9933ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: '#c299ff' }}>{ritual.nome}</strong>
                  <span style={{ fontSize: '11px', color: '#888', background: '#000', padding: '2px 5px', borderRadius: '4px' }}>{ritual.custo}</span>
                </div>
                <div style={{ color: '#ccc', fontSize: '12px' }}>{ritual.efeito}</div>
              </div>
            ))}
          </div>
        )}

        {/* Perícias */}
        {abaAtiva === 'pericias' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {personagem.pericias?.map((pericia: string, index: number) => (
              <div key={index} style={{ background: '#1a1a1a', padding: '8px 12px', borderRadius: '4px', border: '1px solid #333', color: '#00ffcc', fontFamily: 'monospace', fontSize: '12px', textAlign: 'center' }}>
                {pericia}
              </div>
            ))}
          </div>
        )}

        {/* Inventário */}
        {abaAtiva === 'inventario' && (
          <ul style={{ background: '#111', padding: '15px 15px 15px 30px', borderRadius: '8px', border: '1px solid #333', color: '#ccc', lineHeight: '1.6', fontSize: '12px' }}>
            {personagem.inventario?.map((item: string, index: number) => <li key={index} style={{ marginBottom: '5px' }}><strong>{item.split('(')[0]}</strong> {item.includes('(') ? `(${item.split('(')[1]}` : ''}</li>)}
          </ul>
        )}

        {/* Flashback */}
        {abaAtiva === 'flashback' && (
          <div style={{ background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
            {personagem.codinome === 'Itália' && <div style={{ background: '#332200', padding: '8px', borderRadius: '4px', color: 'gold', fontSize: '11px', marginBottom: '10px', borderLeft: '3px solid gold' }}>Vantagem (Famiglia): Reduz -1 PE flashbacks sociais.</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              {[{nome: 'Ação Simples', PE: 1}, {nome: 'Ação Complexa', PE: 3}, {nome: 'Ação Improvável', PE: 6}].map(f => (
                <div key={f.nome} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: '10px', borderRadius: '5px', borderLeft: `3px solid ${f.PE===1 ? '#4caf50' : f.PE===3 ? '#ffcc00' : '#ff4d4d'}` }}>
                  <strong>{f.nome}</strong>
                  <button onClick={() => alterarStatus('pe_atual', -f.PE)} style={{ background: f.PE===1 ? '#4caf50' : f.PE===3 ? '#ffcc00' : '#ff4d4d', color: 'black', border: 'none', padding: '6px 10px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11px' }}>{f.PE} PE</button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* --- ESTILOS NATIVOS COM MEDIA QUERIES (A Mágica do Mobile) --- */}
      <style>{`
        .ficha-container { 
          transition: all 0.5s ease; 
          padding: 20px; 
          width: 95%; /* Ocupa quase tudo no mobile */
          max-width: 650px; /* Limita no desktop */
          margin: 10px auto; 
          background: #0d0d0d; 
          border-radius: 8px; 
          border: 1px solid #333; 
          overflow-x: hidden;
        }
        .modo-persona { background: #0a0000; box-shadow: 0 0 25px rgba(255,0,0,0.2); border: 1px solid red; }
        
        /* GRID DE ATRIBUTOS RESPONSIVO */
        .grid-atributos { 
          display: grid; 
          gap: 8px; 
          margin: 15px 0;
          /* Desktop: 6 colunas */
          grid-template-columns: repeat(6, 1fr); 
        }

        /* AJUSTE PARA CELULAR (Media Query) */
        @media (max-width: 500px) {
          .grid-atributos {
            /* Celular: 3 colunas */
            grid-template-columns: repeat(3, 1fr);
          }
        }

        .btn-mascara { 
          width: 100%; padding: 12px; margin-bottom: 15px;
          background: #111; color: #888; border: 1px dashed #555;
          cursor: pointer; font-family: monospace; font-size: 0.9rem; font-weight: bold;
          transition: all 0.3s;
        }
        .modo-persona .btn-mascara { background: red; color: black; border: 2px solid #ff4d4d; }
        
        .aba-btn {
          background: transparent; color: #666; border: none; padding: 8px 10px; cursor: pointer;
          font-family: 'Courier New', Courier, monospace; font-weight: bold; font-size: 12px;
          border-bottom: 2px solid transparent; transition: 0.3s;
        }
        .aba-btn.ativa { color: gold; border-bottom: 2px solid gold; }
        .modo-persona .aba-btn.ativa { color: red; border-bottom: 2px solid red; }
      `}</style>
    </div>
  );
}