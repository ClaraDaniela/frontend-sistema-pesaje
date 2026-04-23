import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function PesadasChart({ stock }) {
  // Convertir stock a formato para gráfico
  const data = (stock || []).map((item) => ({
    material: item.nombre || "Sin material",
    cantidad: Number(item.stock_total) || 0,
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="material" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="cantidad" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}