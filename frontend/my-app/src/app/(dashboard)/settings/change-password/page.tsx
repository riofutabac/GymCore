'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ArrowLeft, Eye, EyeOff, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
}

export default function ChangePasswordPage() {
  const { user } = useCurrentUser();
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ 
    text: string; 
    type: 'success' | 'error' | 'info' 
  } | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    isValid: false
  });

  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Evaluar fortaleza de la contraseña solo para el campo newPassword
    if (field === 'newPassword') {
      evaluatePasswordStrength(value);
    }

    // Limpiar mensajes cuando el usuario empiece a escribir
    if (message) {
      setMessage(null);
    }
  };

  const evaluatePasswordStrength = (password: string) => {
    const feedback: string[] = [];
    let score = 0;

    // Criterios de validación
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasMinLength) {
      feedback.push('Al menos 8 caracteres');
    } else {
      score += 1;
    }

    if (!hasUpperCase) {
      feedback.push('Al menos una mayúscula');
    } else {
      score += 1;
    }

    if (!hasLowerCase) {
      feedback.push('Al menos una minúscula');
    } else {
      score += 1;
    }

    if (!hasNumbers) {
      feedback.push('Al menos un número');
    } else {
      score += 1;
    }

    if (!hasSpecialChars) {
      feedback.push('Al menos un carácter especial');
    } else {
      score += 1;
    }

    setPasswordStrength({
      score,
      feedback,
      isValid: score >= 4 // Requiere al menos 4 de 5 criterios
    });
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score <= 2) return 'bg-red-500';
    if (passwordStrength.score === 3) return 'bg-yellow-500';
    if (passwordStrength.score === 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength.score <= 2) return 'Débil';
    if (passwordStrength.score === 3) return 'Regular';
    if (passwordStrength.score === 4) return 'Buena';
    return 'Muy segura';
  };

  const validateForm = (): string | null => {
    if (!formData.currentPassword) {
      return 'La contraseña actual es requerida';
    }

    if (!formData.newPassword) {
      return 'La nueva contraseña es requerida';
    }

    if (!passwordStrength.isValid) {
      return 'La nueva contraseña no cumple con los requisitos de seguridad';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return 'Las contraseñas no coinciden';
    }

    if (formData.currentPassword === formData.newPassword) {
      return 'La nueva contraseña debe ser diferente a la actual';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setMessage({
        text: validationError,
        type: 'error'
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // TODO: Tu compañero implementará la llamada a la API
      // await api.users.changeMyPassword({
      //   currentPassword: formData.currentPassword,
      //   newPassword: formData.newPassword
      // });

      console.log('Datos para cambio de contraseña:', {
        userId: user?.id,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        userRole: user?.role
      });

      // Simular llamada a la API
      await new Promise(resolve => setTimeout(resolve, 1500));

      setMessage({
        text: 'Contraseña actualizada correctamente',
        type: 'success'
      });

      // Limpiar formulario después del éxito
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setPasswordStrength({
        score: 0,
        feedback: [],
        isValid: false
      });

    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      setMessage({
        text: 'Error al cambiar la contraseña. Verifica que la contraseña actual sea correcta.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      {/* Botón de volver independiente */}
      <div className="flex justify-start">
        <Link href="/settings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Perfil
          </Button>
        </Link>
      </div>

      {/* Header con título y descripción */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cambiar Contraseña</h1>
        <p className="text-muted-foreground text-lg">
          Actualiza tu contraseña para mantener tu cuenta segura
        </p>
      </div>

      {/* Mensaje de estado */}
      {message && (
        <div className={`rounded-md p-4 flex items-center gap-2 max-w-2xl ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : message.type === 'error'
            ? 'bg-red-50 text-red-800 border border-red-200'
            : 'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Card principal con formulario */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Cambio de Contraseña
            </CardTitle>
            <CardDescription>
              Por seguridad, necesitamos verificar tu contraseña actual antes de cambiarla
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contraseña actual */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña Actual *</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Nueva contraseña */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Ingresa tu nueva contraseña"
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Indicador de fortaleza de contraseña */}
                {formData.newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    
                    {passwordStrength.feedback.length > 0 && (
                      <div className="text-sm text-muted-foreground">
                        <p>Requisitos faltantes:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {passwordStrength.feedback.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirmar nueva contraseña */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirma tu nueva contraseña"
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Indicador de coincidencia */}
                {formData.confirmPassword && (
                  <div className="flex items-center gap-2 text-sm">
                    {formData.newPassword === formData.confirmPassword ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Las contraseñas coinciden</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-600">Las contraseñas no coinciden</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Consejos de seguridad */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h4 className="font-medium text-blue-900 mb-2">Consejos para una contraseña segura:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Usa al menos 8 caracteres</li>
                  <li>• Combina mayúsculas, minúsculas, números y símbolos</li>
                  <li>• Evita información personal (nombres, fechas de nacimiento)</li>
                  <li>• No reutilices contraseñas de otras cuentas</li>
                  <li>• Considera usar un gestor de contraseñas</li>
                </ul>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="submit" 
                  disabled={isLoading || !passwordStrength.isValid || formData.newPassword !== formData.confirmPassword}
                  className="sm:flex-1"
                >
                  {isLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
                </Button>
                <Link href="/settings" className="sm:w-auto">
                  <Button type="button" variant="outline" className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
