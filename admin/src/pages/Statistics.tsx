import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

interface MonthlyData {
  month: string
  invoices: number
  revenue: number
  clients: number
}

export default function Statistics() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [topClients, setTopClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      // Charger toutes les factures
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error

      // Calculer les données mensuelles
      const monthlyMap = new Map<string, { invoices: number; revenue: number; clients: Set<string> }>()

      invoices?.forEach((inv) => {
        const date = new Date(inv.created_at)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        const monthLabel = date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' })

        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, {
            invoices: 0,
            revenue: 0,
            clients: new Set(),
          })
        }

        const data = monthlyMap.get(monthKey)!
        data.invoices++
        data.revenue += inv.total_ttc || 0
        if (inv.client_email) {
          data.clients.add(inv.client_email)
        }
      })

      const monthly = Array.from(monthlyMap.entries())
        .map(([key, value]) => ({
          month: new Date(key + '-01').toLocaleDateString('fr-FR', { year: 'numeric', month: 'short' }),
          invoices: value.invoices,
          revenue: value.revenue,
          clients: value.clients.size,
        }))
        .sort((a, b) => a.month.localeCompare(b.month))

      setMonthlyData(monthly)

      // Top clients
      const clientMap = new Map<string, { name: string; count: number; revenue: number }>()
      invoices?.forEach((inv) => {
        if (inv.client_email) {
          if (!clientMap.has(inv.client_email)) {
            clientMap.set(inv.client_email, {
              name: inv.client_name || inv.client_email,
              count: 0,
              revenue: 0,
            })
          }
          const client = clientMap.get(inv.client_email)!
          client.count++
          client.revenue += inv.total_ttc || 0
        }
      })

      const top = Array.from(clientMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10)

      setTopClients(top)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  if (loading) {
    return <div className="text-center py-12">Chargement des statistiques...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistiques</h1>
        <p className="text-gray-600 mt-2">Analyse des factures générées</p>
      </div>

      {/* Graphique mensuel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Factures par mois</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="invoices" fill="#3b82f6" name="Nombre de factures" />
            <Bar dataKey="clients" fill="#10b981" name="Clients uniques" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenus mensuels */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Revenus par mois</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => `${value.toFixed(2)} €`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Revenus (€)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Top 10 clients</h2>
          <div className="space-y-4">
            {topClients.map((client, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-500">{client.count} facture(s)</p>
                </div>
                <p className="font-semibold text-primary">{client.revenue.toFixed(2)} €</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Répartition des revenus</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topClients.slice(0, 6)}
                dataKey="revenue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {topClients.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toFixed(2)} €`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}







