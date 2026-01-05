/**
 * Fonctions utilitaires pour l'authentification à deux facteurs (2FA)
 * Inspiré du modèle avec génération de QR Code
 * 
 * Processus:
 * Étape A: Génération du secret TOTP (20 bytes, base64)
 * Étape B: Création de l'URI TOTP (format otpauth://totp/...)
 * Étape C: Génération du QR Code à partir de l'URI
 */

import QRCode from 'qrcode'
import { TOTP } from 'otpauth'
import { authenticator } from 'otplib'
import { supabase } from './supabase'

/**
 * Génère un secret TOTP unique pour un utilisateur
 * Crée un secret aléatoire de 20 bytes et l'encode en base64
 * @returns {string} Secret encodé en base64
 */
export const generateTOTPSecret = (): string => {
  // Créer un secret aléatoire de 20 bytes
  const secretBytes = new Uint8Array(20)
  crypto.getRandomValues(secretBytes)
  
  // Encoder en base64 pour stockage dans la base de données
  const secretBase64 = btoa(String.fromCharCode(...secretBytes))
  
  return secretBase64
}

/**
 * Convertit un secret base64 en format utilisable par otpauth
 * Otpauth accepte directement les secrets en différents formats
 * On utilise ici une conversion simple base64 -> bytes -> base32
 * @param {string} secretBase64 - Secret encodé en base64
 * @returns {string} Secret en format base32
 */
const base64ToBase32 = (secretBase64: string): string => {
  try {
    // Décoder base64 vers bytes
    const binaryString = atob(secretBase64)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    // Convertir bytes en base32
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    let result = ''
    let bits = 0
    let value = 0
    
    for (let i = 0; i < bytes.length; i++) {
      value = (value << 8) | bytes[i]
      bits += 8
      
      while (bits >= 5) {
        result += base32Chars[(value >>> (bits - 5)) & 31]
        bits -= 5
      }
    }
    
    if (bits > 0) {
      result += base32Chars[(value << (5 - bits)) & 31]
    }
    
    // Ajouter des padding si nécessaire (base32 doit être multiple de 8)
    while (result.length % 8 !== 0) {
      result += '='
    }
    
    return result
  } catch (error) {
    console.error('Erreur lors de la conversion base64 vers base32:', error)
    // En cas d'erreur, utiliser otplib pour générer un secret valide
    return authenticator.generateSecret()
  }
}

/**
 * Génère un URI TOTP au format otpauth://totp/...
 * Format utilisé par Google Authenticator et autres applications 2FA
 * Exemple: otpauth://totp/AmeCare Santé:admin@amecare.fr?secret=...&issuer=AmeCare Santé
 * 
 * @param {string} secretBase64 - Secret encodé en base64
 * @param {string} email - Email de l'utilisateur
 * @param {string} issuer - Nom du service (ex: "AmeCare Santé")
 * @returns {string} URI TOTP au format otpauth://totp/...
 */
export const generateTOTPUri = (
  secretBase64: string,
  email: string,
  issuer: string = 'AmeCare Santé'
): string => {
  try {
    // Convertir le secret base64 en base32
    const secretBase32 = base64ToBase32(secretBase64)
    
    // Créer l'URI TOTP avec otpauth
    // Format: otpauth://totp/Issuer:Label?secret=SECRET&issuer=Issuer
    const totp = new TOTP({
      issuer: issuer,
      label: email,
      secret: secretBase32.replace(/=/g, ''), // Retirer les padding '=' pour otpauth
      algorithm: 'SHA1',
      digits: 6,
      period: 30
    })
    
    return totp.toString()
  } catch (error) {
    // Fallback: utiliser otplib si otpauth échoue
    console.warn('Erreur avec otpauth, utilisation de otplib en fallback:', error)
    return authenticator.keyuri(email, issuer, base64ToBase32(secretBase64))
  }
}

/**
 * Génère un QR Code à partir d'un URI TOTP
 * @param {string} uri - URI TOTP (format otpauth://totp/...)
 * @returns {Promise<string>} Data URL de l'image QR Code (base64)
 */
export const generateQRCode = async (uri: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(uri, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    })
    
    return qrCodeDataURL
  } catch (error) {
    console.error('Erreur lors de la génération du QR Code:', error)
    throw new Error('Impossible de générer le QR Code')
  }
}

/**
 * Génère un secret, un URI et un QR Code pour un utilisateur
 * Fonction complète pour l'activation du 2FA
 * @param {string} email - Email de l'utilisateur
 * @param {string} issuer - Nom du service (par défaut: "AmeCare Santé")
 * @returns {Promise<{secret: string, uri: string, qrCode: string}>}
 */
export const setup2FA = async (
  email: string,
  issuer: string = 'AmeCare Santé'
): Promise<{ secret: string; uri: string; qrCode: string }> => {
  // Étape A : Générer le secret TOTP
  const secret = generateTOTPSecret()
  
  // Étape B : Créer l'URI TOTP
  const uri = generateTOTPUri(secret, email, issuer)
  
  // Étape C : Générer le QR Code
  const qrCode = await generateQRCode(uri)
  
  return {
    secret,
    uri,
    qrCode
  }
}

/**
 * Active le 2FA pour un utilisateur admin
 * @param {string} adminId - ID de l'administrateur
 * @param {string} secret - Secret TOTP (base64)
 * @param {string} verificationCode - Code de vérification à 6 chiffres de Google Authenticator
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const enable2FA = async (
  adminId: string,
  secret: string,
  verificationCode: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Vérifier que le code est valide
    const secretBase32 = base64ToBase32(secret)
    const totp = new TOTP({ secret: secretBase32 })
    const isValid = totp.validate({ token: verificationCode, window: 1 }) !== null
    
    if (!isValid) {
      return {
        success: false,
        message: 'Code de vérification invalide. Veuillez réessayer.'
      }
    }
    
    // Activer le 2FA dans la base de données
    const { error } = await supabase
      .from('admin_users')
      .update({
        two_factor_secret: secret,
        two_factor_enabled: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId)
    
    if (error) {
      throw error
    }
    
    return {
      success: true,
      message: 'Authentification à deux facteurs activée avec succès!'
    }
  } catch (error: any) {
    console.error('Erreur lors de l\'activation du 2FA:', error)
    return {
      success: false,
      message: error.message || 'Erreur lors de l\'activation du 2FA'
    }
  }
}

/**
 * Désactive le 2FA pour un utilisateur admin
 * @param {string} adminId - ID de l'administrateur
 * @param {string} password - Mot de passe pour confirmation
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const disable2FA = async (
  adminId: string,
  password: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // TODO: Vérifier le mot de passe avant de désactiver le 2FA
    // Pour l'instant, on désactive directement
    
    const { error } = await supabase
      .from('admin_users')
      .update({
        two_factor_secret: null,
        two_factor_enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId)
    
    if (error) {
      throw error
    }
    
    return {
      success: true,
      message: 'Authentification à deux facteurs désactivée avec succès!'
    }
  } catch (error: any) {
    console.error('Erreur lors de la désactivation du 2FA:', error)
    return {
      success: false,
      message: error.message || 'Erreur lors de la désactivation du 2FA'
    }
  }
}

/**
 * Vérifie un code 2FA
 * @param {string} secret - Secret TOTP (base64)
 * @param {string} code - Code à vérifier
 * @returns {boolean} True si le code est valide
 */
export const verify2FACode = (secret: string, code: string): boolean => {
  try {
    const secretBase32 = base64ToBase32(secret)
    const totp = new TOTP({ secret: secretBase32 })
    return totp.validate({ token: code, window: 1 }) !== null
  } catch (error) {
    console.error('Erreur lors de la vérification du code 2FA:', error)
    return false
  }
}

