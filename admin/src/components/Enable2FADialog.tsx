/**
 * Composant pour activer l'authentification à deux facteurs (2FA)
 * Affiche un QR Code à scanner avec Google Authenticator
 */

import { useState, useEffect } from 'react'
import { X, Copy, Check, AlertCircle, QrCode } from 'lucide-react'
import { setup2FA, enable2FA } from '../lib/twoFactorAuth'

interface Enable2FADialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  adminId: string
  adminEmail: string
}

export default function Enable2FADialog({
  isOpen,
  onClose,
  onSuccess,
  adminId,
  adminEmail
}: Enable2FADialogProps) {
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [uri, setUri] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  // Générer le QR Code lorsque le dialogue s'ouvre
  useEffect(() => {
    if (isOpen && !qrCode) {
      generateQRCode()
    }
  }, [isOpen])

  const generateQRCode = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Étape A, B et C : Générer le secret, l'URI et le QR Code
      const result = await setup2FA(adminEmail, 'AmeCare Santé')
      
      setSecret(result.secret)
      setUri(result.uri)
      setQrCode(result.qrCode)
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la génération du QR Code')
    } finally {
      setLoading(false)
    }
  }

  const handleCopySecret = () => {
    if (secret) {
      // Convertir le secret base64 en base32 pour l'affichage
      // L'utilisateur peut le copier manuellement si le scan ne fonctionne pas
      navigator.clipboard.writeText(secret)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleVerifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Veuillez entrer un code à 6 chiffres')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Vérifier et activer le 2FA
      const result = await enable2FA(adminId, secret, verificationCode)

      if (result.success) {
        setSuccess(true)
        setTimeout(() => {
          onSuccess()
          onClose()
          // Réinitialiser le dialogue
          setQrCode('')
          setSecret('')
          setUri('')
          setVerificationCode('')
          setSuccess(false)
        }, 2000)
      } else {
        setError(result.message)
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'activation du 2FA')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <QrCode className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Activer l'authentification à deux facteurs
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">
                  Authentification à deux facteurs activée avec succès!
                </p>
              </div>
            </div>
          )}

          {loading && !qrCode ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Génération du QR Code...</p>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Instructions pour activer le 2FA :
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Téléchargez Google Authenticator sur votre téléphone</li>
                  <li>Scannez le QR Code ci-dessous avec l'application</li>
                  <li>Entrez le code à 6 chiffres affiché dans l'application</li>
                  <li>Cliquez sur "Activer le 2FA" pour terminer</li>
                </ol>
              </div>

              {/* QR Code */}
              {qrCode && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                    <img
                      src={qrCode}
                      alt="QR Code TOTP"
                      className="w-48 h-48 sm:w-64 sm:h-64"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Scannez ce QR Code avec Google Authenticator
                  </p>
                </div>
              )}

              {/* Secret manuel (optionnel) */}
              {secret && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Code secret (si le scan ne fonctionne pas) :
                    </label>
                    <button
                      onClick={handleCopySecret}
                      className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copié
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copier
                        </>
                      )}
                    </button>
                  </div>
                  <code className="text-xs bg-white p-2 rounded border border-gray-200 block break-all">
                    {secret.substring(0, 20)}...
                  </code>
                </div>
              )}

              {/* Code de vérification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code de vérification (6 chiffres)
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                    setVerificationCode(value)
                    setError('')
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                  disabled={loading || success}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Entrez le code à 6 chiffres depuis Google Authenticator
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading || success}
                >
                  Annuler
                </button>
                <button
                  onClick={handleVerifyAndEnable}
                  disabled={loading || success || !verificationCode || verificationCode.length !== 6}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Activation...' : success ? 'Activé!' : 'Activer le 2FA'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}







