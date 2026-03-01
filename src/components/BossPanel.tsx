import { useState } from "react";
import { supabase } from "../supabaseClient";

type Props = {
  boss: any;
  atualizar: () => void;
};

export default function BossPanel({ boss, atualizar }: Props) {
  // Mudamos o estado para aceitar string vazia, evitando bugs no input
  const [dano, setDano] = useState<number | string>("");
  const [expandido, setExpandido] = useState(false);

  const aplicarDano = async (isCura: boolean) => {
    // Se o input estiver vazio ou for 0, não faz nada
    if (!dano || Number(dano) === 0) return;

    // Converte tudo para número para evitar bugs de matemática do JavaScript
    const valorDigitado = Number(dano);
    const vidaAtual = Number(boss.pv_atual);
    const vidaMax = Number(boss.pv_max);

    // Se for cura, soma. Se for dano, subtrai.
    let novoPv = isCura ? vidaAtual + valorDigitado : vidaAtual - valorDigitado;

    // Garante que a vida nunca passe do Máximo e nunca fique abaixo de 0
    novoPv = Math.min(vidaMax, Math.max(0, novoPv));

    // Envia para o Supabase
    const { error } = await supabase
      .from("bosses")
      .update({ pv_atual: novoPv })
      .eq("id", boss.id);

    if (error) {
      console.error("Erro ao atualizar o Boss:", error);
      alert("Erro do Supabase: " + error.message);
    } else {
      setDano(""); // Limpa a caixinha de input
      atualizar(); // Puxa os dados novos para a tela piscar a barra de vida
    }
  };

  const porcentagem = (boss.pv_atual / boss.pv_max) * 100;

  return (
    <div className="card-npc" style={{ borderLeft: '4px solid gold', background: '#0a0a0a', padding: '15px', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ color: 'gold', margin: '0 0 5px 0', textTransform: 'uppercase' }}>{boss.nome}</h3>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>{boss.titulo}</div>
        </div>
        <button 
          onClick={() => setExpandido(!expandido)}
          style={{ background: '#222', border: '1px solid gold', color: 'gold', padding: '5px 10px', cursor: 'pointer', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}
        >
          {expandido ? "▲ OCULTAR" : "▼ VER FICHA"}
        </button>
      </div>
      
      <div style={{ background: "#222", height: 15, width: "100%", borderRadius: '6px', overflow: 'hidden', marginBottom: '5px' }}>
        <div style={{ width: `${porcentagem}%`, height: "100%", background: "linear-gradient(90deg, #ff0000, #8b0000)", transition: 'width 0.5s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '15px', color: '#ccc' }}>
        <span><strong>PV:</strong> {boss.pv_atual} / {boss.pv_max}</span>
        <span><strong>PE:</strong> {boss.pe_atual} / {boss.pe_max}</span>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="number" 
          value={dano} 
          placeholder="0"
          onChange={(e) => setDano(e.target.value)} 
          style={{ width: '100%', padding: '8px', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }} 
        />
        {/* Passamos "false" para Dano e "true" para Cura */}
        <button onClick={() => aplicarDano(false)} style={{ color: '#ff4d4d', background: '#300', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>DANO</button>
        <button onClick={() => aplicarDano(true)} style={{ color: '#4caf50', background: '#030', border: 'none', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>CURA</button>
      </div>

      {expandido && (
        <div style={{ marginTop: '20px', borderTop: '1px solid #333', paddingTop: '15px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', background: '#111', padding: '10px', borderRadius: '4px', border: '1px solid #222' }}>
             <span style={{ color: '#4d79ff', fontSize: '13px' }}><strong>DEF:</strong> {boss.defesa}</span>
             <span style={{ color: '#ff4d4d', fontSize: '13px' }}><strong>ARMA:</strong> {boss.arma || "Não equipada"}</span>
          </div>

          <div style={{ marginBottom: '15px', fontSize: '12px', color: '#bbb', background: '#1a1a1a', padding: '10px', borderRadius: '4px', borderLeft: '3px solid purple' }}>
            <p style={{ margin: '0 0 5px 0' }}><strong style={{ color: 'white' }}>🎯 OBJETIVO:</strong> {boss.objetivo}</p>
            <p style={{ margin: 0 }}><strong style={{ color: 'white' }}>🧠 PERSONALIDADE:</strong> {boss.personalidade}</p>
          </div>

          {boss.mecanica && (
            <div style={{ marginBottom: '15px', padding: '10px', background: '#1a1a2e', borderLeft: '3px solid #4d79ff' }}>
              <strong style={{ color: '#4d79ff', fontSize: '12px' }}>MECÂNICA DE CHEFE:</strong>
              <p style={{ fontSize: '12px', color: '#ccc', margin: '5px 0 0 0' }}>{boss.mecanica}</p>
            </div>
          )}

          <h4 style={{ color: 'gold', fontSize: '12px', borderBottom: '1px solid gold', paddingBottom: '3px' }}>🔥 HABILIDADES ESPECIAIS</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
            {boss.habilidades?.map((hab: any, i: number) => (
              <div key={i} style={{ background: '#111', padding: '10px', borderRadius: '4px', borderLeft: '3px solid red' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '12px', color: '#ff4d4d' }}>{hab.nome}</strong>
                  <span style={{ fontSize: '11px', color: '#888', background: '#000', padding: '2px 5px', borderRadius: '3px' }}>{hab.custo}</span>
                </div>
                <div style={{ fontSize: '11px', color: '#999' }}>{hab.efeito}</div>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}