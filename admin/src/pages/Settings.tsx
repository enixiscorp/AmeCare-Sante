/**
 * Page des paramètres de l'administrateur
 * Permet de gérer l'authentification à deux facteurs (2FA)
 */

import { useState, useEffect } from 'react'
import { Shield, Lock, KeyRound, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { disable2FA } from '../lib/twoFactorAuth'
import Enable2FADialog from '../components/Enable2FADialog'

interface AdminUser {
  id: string
  email: string
  two_factor_enabled: boolean
  two_factor_secret: string | null
}

export default function Settings() {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEnableDialog, setShowEnableDialog] = useState(false)
  const [disabling2FA, setDisabling2FA] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      // Récupérer les données de l'admin connecté depuis localStorage
      const adminUserStr = localStorage.getItem('admin_user')
      if (!adminUserStr) {
        throw new Error('Aucun administrateur connecté')
      }

      const adminUser = JSON.parse(adminUserStr)
      
      // Récupérer les données à jour depuis Supabase
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, two_factor_enabled, two_factor_secret')
        .eq('id', adminUser.id)
        .single()

      if (error) throw error

      setAdmin(data)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!admin) return

    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir désactiver l\'authentification à deux facteurs ?\n\n' +
      'Votre compte sera moins sécurisé sans 2FA.'
    )

    if (!confirmed) return

    try {
      setDisabling2FA(true)
      setError('')
      setSuccess('')

      const result = await disable2FA(admin.id, '')

      if (result.success) {
        setSuccess(result.message)
        // Recharger les données de l'admin
        await loadAdminData()
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la désactivation du 2FA')
    } finally {
      setDisabling2FA(false)
    }
  }

  const handle2FAEnabled = () => {
    setSuccess('Authentification à deux facteurs activée avec succès!')
    loadAdminData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!admin) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Impossible de charger les données de l'administrateur</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-2">Gérez vos préférences et votre sécurité</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-600 hover:text-red-800"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-green-800">{success}</p>
          </div>
          <button
            onClick={() => setSuccess('')}
            className="text-green-600 hover:text-green-800"
          >
            ×
          </button>
        </div>
      )}

      {/* Informations du compte */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Informations du compte</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-gray-900">{admin.email}</p>
          </div>
        </div>
      </div>

      {/* Sécurité */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Sécurité</h2>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {/* Authentification à deux facteurs */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <KeyRound className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900">
                  Authentification à deux facteurs (2FA)
                </h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Ajoutez une couche de sécurité supplémentaire à votre compte en activant 
                l'authentification à deux facteurs avec Google Authenticator.
              </p>
              
              {admin.two_factor_enabled ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">2FA activé</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500">
                  <XCircle className="w-5 h-5" />
                  <span className="text-sm">2FA non activé</span>
                </div>
              )}
            </div>
            
            <div className="ml-4">
              {admin.two_factor_enabled ? (
                <button
                  onClick={handleDisable2FA}
                  disabled={disabling2FA}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {disabling2FA ? 'Désactivation...' : 'Désactiver le 2FA'}
                </button>
              ) : (
                <button
                  onClick={() => setShowEnableDialog(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Activer le 2FA
                </button>
              )}
            </div>
          </div>

          {/* Informations sur le 2FA */}
          {!admin.two_factor_enabled && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                Comment fonctionne le 2FA ?
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                <li>Un code QR unique sera généré pour votre compte</li>
                <li>Scannez le QR Code avec Google Authenticator</li>
                <li>À chaque connexion, entrez le code à 6 chiffres depuis l'application</li>
                <li>Le code change toutes les 30 secondes pour plus de sécurité</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Dialog d'activation du 2FA */}
      {showEnableDialog && admin && (
        <Enable2FADialog
          isOpen={showEnableDialog}
          onClose={() => setShowEnableDialog(false)}
          onSuccess={handle2FAEnabled}
          adminId={admin.id}
          adminEmail={admin.email}
        />
      )}
    </div>
  )
}







