import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  getCategoryExpenseTotals,
  getDailyExpenseTotals,
} from '../utils/chartData'
import { formatCurrency } from '../utils/formatters'

function formatTooltip(value) {
  return formatCurrency(value)
}

const tooltipStyle = {
  border: '1px solid #d8e0ea',
  borderRadius: 8,
  boxShadow: '0 8px 20px rgb(15 23 42 / 12%)',
}

export function ExpenseCharts({ expenses }) {
  const dailyTotals = getDailyExpenseTotals(expenses)
  const categoryTotals = getCategoryExpenseTotals(expenses)

  return (
    <section className="charts-panel" aria-labelledby="charts-title">
      <div className="section-heading compact-heading">
        <h2 id="charts-title">Grafieken</h2>
      </div>

      {expenses.length === 0 ? (
        <p className="empty-state">Voeg uitgaven toe om grafieken te zien.</p>
      ) : (
        <div className="charts-grid">
          <article>
            <h3>Uitgaven per dag</h3>
            <div className="chart-frame area-chart-frame" aria-label="Lijngrafiek per dag">
              <ResponsiveContainer width="100%" height={170}>
                <AreaChart data={dailyTotals} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="daily-total-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="8%" stopColor="#14b8a6" stopOpacity={0.34} />
                      <stop offset="92%" stopColor="#14b8a6" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e6edf5" vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="label"
                    minTickGap={20}
                    tick={{ fill: '#66758a', fontSize: 11 }}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tick={{ fill: '#66758a', fontSize: 11 }}
                    tickFormatter={(value) => `€ ${value}`}
                    tickLine={false}
                    width={52}
                  />
                  <Tooltip contentStyle={tooltipStyle} formatter={formatTooltip} />
                  <Area
                    type="natural"
                    dataKey="total"
                    fill="url(#daily-total-fill)"
                    name="Uitgaven"
                    stroke="#0f766e"
                    strokeLinecap="round"
                    strokeWidth={2}
                    dot={{ fill: '#ffffff', r: 3, stroke: '#0f766e', strokeWidth: 2 }}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <ul className="chart-legend">
              {dailyTotals.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{formatCurrency(item.total)}</strong>
                </li>
              ))}
            </ul>
          </article>

          <article>
            <h3>Uitgaven per categorie</h3>
            <div className="chart-frame" aria-label="Staafdiagram per categorie">
              <ResponsiveContainer width="100%" height={170}>
                <BarChart
                  data={categoryTotals}
                  layout="vertical"
                  barCategoryGap={12}
                  margin={{ top: 8, right: 12, left: 8, bottom: 0 }}
                >
                  <CartesianGrid horizontal={false} stroke="#e6edf5" />
                  <XAxis
                    axisLine={false}
                    tick={{ fill: '#66758a', fontSize: 11 }}
                    tickFormatter={(value) => `€ ${value}`}
                    tickLine={false}
                    type="number"
                  />
                  <YAxis
                    axisLine={false}
                    dataKey="label"
                    tick={{ fill: '#66758a', fontSize: 11 }}
                    tickLine={false}
                    type="category"
                    width={92}
                  />
                  <Tooltip contentStyle={tooltipStyle} formatter={formatTooltip} />
                  <Bar
                    background={{ fill: '#eef4f8', radius: 6 }}
                    dataKey="total"
                    fill="#2563eb"
                    name="Uitgaven"
                    radius={[0, 6, 6, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="chart-legend">
              {categoryTotals.map((item) => (
                <li key={item.label}>
                  <span>{item.label}</span>
                  <strong>{formatCurrency(item.total)}</strong>
                </li>
              ))}
            </ul>
          </article>
        </div>
      )}
    </section>
  )
}
