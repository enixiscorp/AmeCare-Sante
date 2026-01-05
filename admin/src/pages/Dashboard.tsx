import { useEffect, useState } from 'react'
import { supabase, Invoice } from '../lib/supabase'
import { FileText, Users, TrendingUp, DollarSign } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    uniqueClients: 0,
    invoicesToday: 0,
  })
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Charger les statistiques
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      // Calculer les statistiques
      const totalInvoices = invoices?.length || 0
      const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_ttc || 0), 0) || 0
      const uniqueClients = new Set(invoices?.map(inv => inv.client_email).filter(Boolean)).size
      
      const today = new Date().toISOString().split('T')[0]
      const invoicesToday = invoices?.filter(inv => 
        inv.created_at?.startsWith(today)
      ).length || 0

      setStats({
        totalInvoices,
        totalRevenue,
        uniqueClients,
        invoicesToday,
      })

      // Charger les 10 dernières factures
      setRecentInvoices(invoices?.slice(0, 10) || [])
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-2">Vue d'ensemble des factures générées</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total factures"
          value={stats.totalInvoices}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Revenus totaux"
          value={`${stats.totalRevenue.toFixed(2)} €`}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Clients uniques"
          value={stats.uniqueClients}
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Aujourd'hui"
          value={stats.invoicesToday}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Dernières factures */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Dernières factures générées</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Facture</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant TTC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucune facture générée pour le moment
                  </td>
                </tr>
              ) : (
                recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.client_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {invoice.total_ttc.toFixed(2)} {invoice.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.user_id.substring(0, 8)}...
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: {
  title: string
  value: string | number
  icon: any
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

