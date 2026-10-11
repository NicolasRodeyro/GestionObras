import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#4f46e5', '#0ea5e9', '#f59e0b', '#10b981', '#ef4444'];

const currencyFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

interface CategoriaChartProps {
  data: Record<string, number>;
}

export function CategoriaChart({ data }: CategoriaChartProps) {
  const entries = Object.entries(data).filter(([, value]) => value > 0);

  if (entries.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400">Sin datos para mostrar</p>;
  }

  const chartData = entries.map(([categoria, monto]) => ({ categoria, monto }));

  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={chartData} dataKey="monto" nameKey="categoria" outerRadius={90} label>
            {chartData.map((entry, index) => (
              <Cell key={entry.categoria} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => currencyFormatter.format(Number(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
