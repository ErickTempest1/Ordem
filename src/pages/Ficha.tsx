import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function Ficha({ player }: { player: any }) {
  const [personagem, setPersonagem] = useState(player);
  const [mascaraAtiva, setMascaraAtiva] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('habilidades');
  
  // Novo estado para o input da mochila
  const [novoItem, setNovoItem] = useState('');

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

  // --- FUNÇÕES DA MOCHILA DINÂMICA ---
  const adicionarItem = async () => {
    if (!novoItem.trim()) return; // Evita adicionar itens vazios
    
    // Pega o inventário atual (ou cria um array vazio) e adiciona o novo
    const inventarioAtualizado = [...(personagem.inventario || []), novoItem];
    
    // Atualiza a tela imediatamente para o jogador não sentir delay
    setPersonagem((prev: any) => ({ ...prev, inventario: inventarioAtualizado }));
    setNovoItem(''); // Limpa o input
    
    // Salva no banco de dados
    await supabase.from("personagens").update({ inventario: inventarioAtualizado }).eq("id", personagem.id);
  };

  const removerItem = async (indexParaRemover: number) => {
    // Filtra o array, tirando apenas o item que foi clicado
    const inventarioAtualizado = personagem.inventario.filter((_: any, index: number) => index !== indexParaRemover);
    
    setPersonagem((prev: any) => ({ ...prev, inventario: inventarioAtualizado }));
    await supabase.from("personagens").update({ inventario: inventarioAtualizado }).eq("id", personagem.id);
  };
  // -----------------------------------

  const habilidadesAtuais = mascaraAtiva ? personagem.habilidades_mascara : personagem.habilidades_base;
  const temRituais = personagem.rituais && personagem.rituais.length > 0;

  const ControleVital = ({ label, atual, max, color, tipo }: any) => (
    <div style={{ marginBottom: '15px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', color, fontSize: '13px', fontWeight: 'bold', marginBottom: '5px' }}>
        <span>{label}</span>
        <span>{atual} / {max}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '100%', flexWrap: 'nowrap' }}>
        <button onClick={() => alterarStatus(tipo, -5)} style={{ flex: '0 0 auto', background: '#400', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>-5</button>
        <button onClick={() => alterarStatus(tipo, -1)} style={{ flex: '0 0 auto', background: '#200', color: '#ff4d4d', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>-1</button>
        
        <div style={{ flex: '1 1 auto', background: '#222', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{ width: `${(atual / max) * 100}%`, background: color, height: '100%', transition: 'width 0.3s' }}></div>
        </div>
        
        <button onClick={() => alterarStatus(tipo, 1)} style={{ flex: '0 0 auto', background: '#020', color: '#4caf50', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>+1</button>
        <button onClick={() => alterarStatus(tipo, 5)} style={{ flex: '0 0 auto', background: '#040', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>+5</button>
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

      <div style={{ display: 'flex', gap: '5px', marginTop: '20px', borderBottom: '1px solid #333', paddingBottom: '8px', overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch' }}>
        <button className={`aba-btn ${abaAtiva === 'habilidades' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('habilidades')}>⚔️ HABS</button>
        {temRituais && <button className={`aba-btn ${abaAtiva === 'rituais' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('rituais')}>📖 RITUAIS</button>}
        <button className={`aba-btn ${abaAtiva === 'pericias' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('pericias')}>🎯 PERÍCIAS</button>
        <button className={`aba-btn ${abaAtiva === 'inventario' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('inventario')}>🎒 MOCHILA</button>
        <button className={`aba-btn ${abaAtiva === 'flashback' ? 'ativa' : ''}`} onClick={() => setAbaAtiva('flashback')}>🎞️ FLASH</button>
      </div>

      <div style={{ marginTop: '15px', minHeight: '180px', fontSize: '13px' }}>
        {abaAtiva === 'habilidades' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {habilidadesAtuais?.map((hab: any, index: number) => (
              <div key={index} style={{ background: mascaraAtiva ? '#2a0000' : '#222', padding: '12px', borderRadius: '5px', borderLeft: mascaraAtiva ? '3px solid red' : '3px solid gold' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: mascaraAtiva ? '#ff4d4d' : '#fff', fontSize: '14px' }}>{hab.nome}</strong>
                  <span style={{ fontSize: '11px', color: '#888', background: '#000', padding: '2px 6px', borderRadius: '4px' }}>{hab.custo}</span>
                </div>
                <div style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.4' }}>{hab.efeito}</div>
              </div>
            ))}
          </div>
        )}

        {abaAtiva === 'rituais' && temRituais && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {personagem.rituais?.map((ritual: any, index: number) => (
              <div key={index} style={{ background: '#111', padding: '12px', borderRadius: '5px', borderLeft: '3px solid #9933ff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <strong style={{ color: '#c299ff', fontSize: '14px' }}>{ritual.nome}</strong>
                  <span style={{ fontSize: '11px', color: '#888', background: '#000', padding: '2px 6px', borderRadius: '4px' }}>{ritual.custo}</span>
                </div>
                <div style={{ color: '#ccc', fontSize: '13px', lineHeight: '1.4' }}>{ritual.efeito}</div>
              </div>
            ))}
          </div>
        )}

        {abaAtiva === 'pericias' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {personagem.pericias?.map((pericia: string, index: number) => (
              <div key={index} style={{ background: '#1a1a1a', padding: '10px 12px', borderRadius: '4px', border: '1px solid #333', color: '#00ffcc', fontFamily: 'monospace', fontSize: '13px', textAlign: 'center' }}>
                {pericia}
              </div>
            ))}
          </div>
        )}

        {/* --- MOCHILA DINÂMICA (ATUALIZADA) --- */}
        {abaAtiva === 'inventario' && (
          <div style={{ background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
            
            {/* Campo para Adicionar Novo Item */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
              <input 
                type="text" 
                value={novoItem}
                onChange={(e) => setNovoItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && adicionarItem()}
                placeholder="Adicionar novo item..."
                style={{ flex: 1, padding: '10px', background: '#000', color: '#fff', border: '1px solid #444', borderRadius: '4px', outline: 'none', fontSize: '13px' }}
              />
              <button 
                onClick={adicionarItem}
                style={{ padding: '0 15px', background: '#4caf50', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}
              >
                +
              </button>
            </div>

            {/* Lista de Itens com botão de Remover */}
            {personagem.inventario && personagem.inventario.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, color: '#ccc', fontSize: '13px' }}>
                {personagem.inventario.map((item: string, index: number) => (
                  <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: '10px 12px', marginBottom: '8px', borderRadius: '4px', borderLeft: '3px solid #888' }}>
                    
                    <span style={{ lineHeight: '1.4', paddingRight: '10px' }}>
                      <strong>{item.split('(')[0]}</strong> {item.includes('(') ? `(${item.split('(')[1]}` : ''}
                    </span>
                    
                    <button 
                      onClick={() => removerItem(index)}
                      style={{ background: 'transparent', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontSize: '16px', padding: '0 5px', flexShrink: 0 }}
                      title="Descartar Item"
                    >
                      ✖
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ textAlign: 'center', color: '#666', padding: '20px 0', fontStyle: 'italic' }}>A mochila está vazia.</div>
            )}
          </div>
        )}

        {abaAtiva === 'flashback' && (
          <div style={{ background: '#111', padding: '15px', borderRadius: '8px', border: '1px solid #333' }}>
            <h3 style={{ color: 'gold', marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '10px', fontSize: '16px' }}>🎞️ CENA DE FLASHBACK</h3>
            <p style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.5', marginBottom: '15px' }}>
              Declare que seu personagem previu a situação e se preparou no passado. O Mestre aprova o custo pela complexidade da sua ideia.
            </p>
            
            {personagem.codinome === 'Itália' && (
              <div style={{ background: '#332200', padding: '10px', borderRadius: '4px', color: 'gold', fontSize: '12px', marginBottom: '15px', borderLeft: '3px solid gold' }}>
                <strong>Vantagem (Famiglia):</strong> Reduz -1 PE em flashbacks sociais/contatos!
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                {nome: 'Ação Simples', PE: 1, desc: 'Ex: Esconder uma arma na sala, destrancar uma porta.'},
                {nome: 'Ação Complexa', PE: 3, desc: 'Ex: Plantar explosivos na fundação, subornar guardas.'},
                {nome: 'Ação Improvável', PE: 6, desc: 'Ex: Hackear o sistema dias antes, ter fuga de helicóptero.'}
              ].map(f => (
                <div key={f.nome} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1a1a1a', padding: '12px', borderRadius: '5px', borderLeft: `3px solid ${f.PE===1 ? '#4caf50' : f.PE===3 ? '#ffcc00' : '#ff4d4d'}` }}>
                  <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '10px' }}>
                    <strong style={{ color: 'white', fontSize: '14px' }}>{f.nome}</strong>
                    <span style={{ fontSize: '11px', color: '#888', marginTop: '4px', lineHeight: '1.3' }}>{f.desc}</span>
                  </div>
                  <button onClick={() => alterarStatus('pe_atual', -f.PE)} style={{ background: f.PE===1 ? '#4caf50' : f.PE===3 ? '#ffcc00' : '#ff4d4d', color: 'black', border: 'none', padding: '8px 12px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}>{f.PE} PE</button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      <style>{`
        .ficha-container { 
          transition: all 0.5s ease; 
          padding: 20px; 
          width: 90%; 
          max-width: 650px; 
          margin: 20px auto; 
          background: #0d0d0d; 
          border-radius: 8px; 
          border: 1px solid #333; 
          overflow-x: hidden;
        }
        .modo-persona { background: #0a0000; box-shadow: 0 0 25px rgba(255,0,0,0.2); border: 1px solid red; }
        
        .grid-atributos { 
          display: grid; 
          gap: 8px; 
          margin: 15px 0;
          grid-template-columns: repeat(6, 1fr); 
        }

        @media (max-width: 500px) {
          .grid-atributos {
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
          background: transparent; color: #666; border: none; padding: 8px 12px; cursor: pointer;
          font-family: 'Courier New', Courier, monospace; font-weight: bold; font-size: 13px;
          border-bottom: 2px solid transparent; transition: 0.3s;
        }
        .aba-btn.ativa { color: gold; border-bottom: 2px solid gold; }
        .modo-persona .aba-btn.ativa { color: red; border-bottom: 2px solid red; }
      `}</style>
    </div>
  );
}