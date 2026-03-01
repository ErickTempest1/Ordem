import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function SubordinadosPanel({ lista, atualizar }: { lista: any[], atualizar: () => void }) {
  // Guarda quais facções estão com o painel aberto
  const [faccoesAbertas, setFaccoesAbertas] = useState<string[]>([]);

  const toggleFaccao = (faccao: string) => {
    if (faccoesAbertas.includes(faccao)) {
      setFaccoesAbertas(faccoesAbertas.filter(f => f !== faccao));
    } else {
      setFaccoesAbertas([...faccoesAbertas, faccao]);
    }
  };

  const aplicarDano = async (sub: any, dano: number) => {
    const novoPv = Math.max(0, sub.pv_atual - dano);
    await supabase.from("subordinados").update({ pv_atual: novoPv }).eq("id", sub.id);
    atualizar();
  };

  const matarSubordinado = async (id: string) => {
    if(confirm("Remover este inimigo do combate?")) {
      await supabase.from("subordinados").delete().eq("id", id);
      atualizar();
    }
  };

  // Separa os subordinados por grupo
  const faccoes = [...new Set(lista.map(s => s.grupo))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {faccoes.map(faccao => {
        const membros = lista.filter(s => s.grupo === faccao);
        const isOpen = faccoesAbertas.includes(faccao);

        return (
          <div key={faccao} style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '5px' }}>
            {/* Cabeçalho da Facção (Acordeão) */}
            <div 
              onClick={() => toggleFaccao(faccao)}
              style={{ padding: '15px', background: '#111', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isOpen ? '1px solid #333' : 'none' }}
            >
              <h3 style={{ margin: 0, color: '#ff4d4d', textTransform: 'uppercase' }}>🏴 {faccao} ({membros.length})</h3>
              <span style={{ color: 'gray' }}>{isOpen ? '▲ RECOLHER' : '▼ EXPANDIR'}</span>
            </div>

            {/* Lista de Membros da Facção */}
            {isOpen && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px', padding: '15px' }}>
                {membros.map(sub => (
                  <div key={sub.id} style={{ background: '#151515', border: '1px solid #222', borderRadius: '5px', padding: '15px', borderLeft: '4px solid #ff4d4d' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <h4 style={{ margin: 0, color: '#fff', fontSize: '15px' }}>{sub.nome}</h4>
                      <button onClick={() => matarSubordinado(sub.id)} style={{ background: 'transparent', border: 'none', color: 'red', cursor: 'pointer' }}>☠️</button>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', fontSize: '12px', color: '#aaa', marginBottom: '15px' }}>
                      <span style={{ background: '#222', padding: '3px 6px', borderRadius: '3px' }}><strong>PV:</strong> {sub.pv_atual}/{sub.pv_max}</span>
                      <span style={{ background: '#222', padding: '3px 6px', borderRadius: '3px' }}><strong>DEF:</strong> {sub.defesa}</span>
                    </div>

                    {/* Dano Rápido Capanga */}
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                      <button onClick={() => aplicarDano(sub, 5)} style={{ flex: 1, padding: '5px', background: '#300', color: 'red', border: '1px solid #500', cursor: 'pointer' }}>-5 PV</button>
                      <button onClick={() => aplicarDano(sub, 10)} style={{ flex: 1, padding: '5px', background: '#500', color: 'white', border: '1px solid #700', cursor: 'pointer' }}>-10 PV</button>
                    </div>

                    <div style={{ borderTop: '1px solid #333', paddingTop: '10px', fontSize: '12px', color: '#ccc', marginBottom: '10px' }}>
                      <strong style={{ color: '#4d79ff' }}>ARMA:</strong> {sub.arma || "Arma Branca"}
                    </div>
                    
                    {/* Habilidades do Capanga */}
                    {sub.habilidades?.map((hab: any, idx: number) => (
                      <div key={idx} style={{ background: '#000', padding: '8px', borderRadius: '4px', marginBottom: '5px', borderLeft: '2px solid gray' }}>
                        <strong style={{ fontSize: '11px', color: 'gold', display: 'block' }}>{hab.nome}</strong>
                        <span style={{ fontSize: '11px', color: '#999' }}>{hab.efeito}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}