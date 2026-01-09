import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, Invoice } from '../lib/supabase'
import { FileText, Users, TrendingUp, DollarSign, Eye } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
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
      // Charger toutes les factures (pas seulement 100)
      const { data: invoices, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Calculer les statistiques
      const totalInvoices = invoices?.length || 0
      const totalRevenue = invoices?.reduce((sum, inv) => sum + (parseFloat(String(inv.total_ttc)) || 0), 0) || 0
      const uniqueClients = new Set(invoices?.map(inv => inv.client_email).filter(Boolean)).size
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const invoicesToday = invoices?.filter(inv => {
        const invDate = new Date(inv.created_at)
        invDate.setHours(0, 0, 0, 0)
        return invDate.getTime() === today.getTime()
      }).length || 0

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
      alert('Erreur lors du chargement des données. Vérifiez votre connexion à Supabase.')
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
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Dernières factures générées</h2>
          <button
            onClick={() => navigate('/invoices')}
            className="text-primary hover:text-primary/80 text-sm font-medium"
          >
            Voir toutes les factures →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Facture</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant TTC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
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
                      {invoice.client_email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(invoice.invoice_date).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {parseFloat(String(invoice.total_ttc)).toFixed(2)} {invoice.currency || '€'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-mono text-xs">{invoice.user_id.substring(0, 8)}...</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => navigate(`/invoices?invoice=${invoice.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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







