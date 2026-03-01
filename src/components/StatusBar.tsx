export default function StatusBar({ label, atual, max, color }: { label: string; atual: number; max: number; color: string }) {
  const porcentagem = Math.min(100, Math.max(0, (atual / max) * 100));

  return (
    <div style={{ marginBottom: 15 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <strong style={{ fontSize: '12px' }}>{label}</strong>
        <span style={{ fontSize: '12px' }}>{atual} / {max}</span>
      </div>
      <div style={{ background: "#222", height: 12, width: "100%", borderRadius: '6px', overflow: 'hidden' }}>
        <div
          style={{
            background: color || "#4caf50",
            height: "100%",
            width: `${porcentagem}%`,
            transition: 'width 0.5s ease-in-out'
          }}
        />
      </div>
    </div>
  );
}