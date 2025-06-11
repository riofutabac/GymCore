'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { User, Save, Camera, Shield, AlertCircle, Briefcase, Users, Crown } from 'lucide-react';
import { UserRole } from '@/lib/types';
import Image from 'next/image';
import api from '@/lib/api';
import Link from 'next/link';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  avatarUrl: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  // Campos adicionales que podrían estar en metadata
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  birthDate?: string;
  medicalInfo?: string;
  // Campos específicos para staff/managers
  employeeId?: string;
  department?: string;
  startDate?: string;
  salary?: number;
}

export default function ProfilePage() {
  const { user } = useCurrentUser();
  
  // Debug: verificar que la página se está cargando
  console.log('Página de settings cargando, usuario:', user);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Formulario de datos editables
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    birthDate: '',
    medicalInfo: '',
    // Campos específicos para roles de staff
    department: '',
    employeeId: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        // TODO: Tu compañero implementará la llamada real a la API
        // const profileData = await api.users.getMyProfile();
        
        if (user) {
          const mockProfile: UserProfile = {
            id: user.id,
            email: user.email,
            name: user.name || '',
            phone: user.phone || '',
            avatarUrl: user.avatarUrl || null,
            role: user.role,
            isActive: true,
            emailVerified: false,
            createdAt: new Date().toISOString(),
            // Datos adicionales simulados
            address: '',
            emergencyContact: '',
            emergencyPhone: '',
            birthDate: '',
            medicalInfo: '',
            // Datos específicos para staff
            employeeId: user.role !== UserRole.CLIENT ? 'EMP-001' : undefined,
            department: user.role === UserRole.MANAGER ? 'Administración' : user.role === UserRole.RECEPTION ? 'Recepción' : undefined,
            startDate: user.role !== UserRole.CLIENT ? '2024-01-01' : undefined
          };
          
          setProfile(mockProfile);
          setFormData({
            name: mockProfile.name,
            phone: mockProfile.phone,
            address: mockProfile.address || '',
            emergencyContact: mockProfile.emergencyContact || '',
            emergencyPhone: mockProfile.emergencyPhone || '',
            birthDate: mockProfile.birthDate || '',
            medicalInfo: mockProfile.medicalInfo || '',
            department: mockProfile.department || '',
            employeeId: mockProfile.employeeId || ''
          });
        }
      } catch (error) {
        console.error('Error al cargar perfil:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Tu compañero implementará la llamada a la API
      // await api.users.updateMyProfile(formData);
      
      console.log('Datos a guardar:', formData);
      console.log('Rol del usuario:', user?.role);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = () => {
    // TODO: Tu compañero implementará la funcionalidad de cambio de avatar
    console.log('Cambiar avatar - funcionalidad pendiente');
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case UserRole.OWNER:
        return <Crown className="h-5 w-5" />;
      case UserRole.MANAGER:
        return <Briefcase className="h-5 w-5" />;
      case UserRole.RECEPTION:
        return <Users className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleTitle = () => {
    switch (user?.role) {
      case UserRole.OWNER:
        return 'Propietario';
      case UserRole.MANAGER:
        return 'Gerente';
      case UserRole.RECEPTION:
        return 'Recepcionista';
      case UserRole.CLIENT:
        return 'Cliente';
      default:
        return 'Usuario';
    }
  };

  const canEditField = (field: string) => {
    // Lógica de permisos por campo y rol
    switch (field) {
      case 'email':
        return false; // Nadie puede editar email
      case 'role':
        return false; // Solo admins pueden cambiar roles
      case 'salary':
        return false; // Solo owners/managers pueden ver/editar salarios
      case 'employeeId':
        return user?.role === UserRole.OWNER; // Solo owners pueden editar IDs de empleado
      case 'department':
        return user?.role === UserRole.OWNER || user?.role === UserRole.MANAGER;
      case 'medicalInfo':
        return true; // Todos pueden editar su info médica
      default:
        return true; // Por defecto, los campos personales son editables
    }
  };

  const shouldShowField = (field: string) => {
    // Qué campos mostrar según el rol
    switch (field) {
      case 'medicalInfo':
        return user?.role === UserRole.CLIENT; // Solo clientes ven info médica
      case 'employeeId':
      case 'department':
      case 'startDate':
        return user?.role !== UserRole.CLIENT; // Solo staff ve campos laborales
      default:
        return true;
    }
  };

  if (isLoading) {
    console.log('Settings página: cargando perfil...');
    return (
      <div className="container mx-auto py-10">
        <div className="h-96 flex items-center justify-center">
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    console.log('Settings página: no se pudo cargar el perfil');
    return (
      <div className="container mx-auto py-10">
        <div className="h-96 flex items-center justify-center">
          <p>No se pudo cargar el perfil</p>
        </div>
      </div>
    );
  }

  console.log('Settings página: renderizando perfil correctamente');
  
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal - {getRoleTitle()}
          </p>
        </div>
        
        {hasChanges && (
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Información del Sistema
            </CardTitle>
            <CardDescription>
              Información controlada por administradores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt="Avatar"
                    width={80}
                    height={80}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  onClick={handleAvatarChange}
                >
                  <Camera className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Campos de solo lectura */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <Input value={profile.email} disabled className="bg-gray-50" />
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Rol</Label>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getRoleIcon()}
                    {getRoleTitle()}
                  </span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Estado de la cuenta</Label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {profile.isActive ? "Activa" : "Inactiva"}
                  </span>
                </div>
              </div>
              
              {shouldShowField('employeeId') && profile.employeeId && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">ID de Empleado</Label>
                  <Input 
                    value={profile.employeeId} 
                    disabled={!canEditField('employeeId')}
                    className={!canEditField('employeeId') ? "bg-gray-50" : ""}
                  />
                </div>
              )}
              
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Miembro desde</Label>
                <Input 
                  value={new Date(profile.createdAt).toLocaleDateString('es-ES')} 
                  disabled 
                  className="bg-gray-50" 
                />
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">
                Para modificar tu email o rol, contacta al administrador del sistema.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información personal */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getRoleIcon()}
              Información Personal
            </CardTitle>
            <CardDescription>
              Información que puedes actualizar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Tu nombre completo"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+593 99 999 9999"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Dirección</Label>
              <textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Tu dirección completa"
                rows={2}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
              />
            </div>

            {/* Campos específicos para staff */}
            {shouldShowField('department') && (
              <div>
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="Departamento de trabajo"
                  disabled={!canEditField('department')}
                  className={!canEditField('department') ? "bg-gray-50" : ""}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContact">Contacto de Emergencia</Label>
                <Input
                  id="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Nombre del contacto"
                />
              </div>
              
              <div>
                <Label htmlFor="emergencyPhone">Teléfono de Emergencia</Label>
                <Input
                  id="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="+593 99 999 9999"
                />
              </div>
            </div>

            {/* Solo para clientes */}
            {shouldShowField('medicalInfo') && (
              <div>
                <Label htmlFor="medicalInfo">Información Médica Relevante</Label>
                <textarea
                  id="medicalInfo"
                  value={formData.medicalInfo}
                  onChange={(e) => handleInputChange('medicalInfo', e.target.value)}
                  placeholder="Alergias, condiciones médicas, medicamentos, etc."
                  rows={3}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Esta información es confidencial y solo será usada en caso de emergencia.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuraciones de cuenta */}
      <Card>
        <CardHeader>
          <CardTitle>Configuraciones de Cuenta</CardTitle>
          <CardDescription>
            Configuraciones adicionales de tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Cambiar Contraseña</h4>
              <p className="text-sm text-muted-foreground">
                Actualiza tu contraseña para mantener tu cuenta segura
              </p>
            </div>
            <Link href="/settings/change-password">
              <Button variant="outline">
                Cambiar
              </Button>
            </Link>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Notificaciones por Email</h4>
              <p className="text-sm text-muted-foreground">
                Recibe notificaciones importantes por email
              </p>
            </div>
            <Button variant="outline" onClick={() => console.log('Configurar notificaciones - pendiente')}>
              Configurar
            </Button>
          </div>

          {user?.role === UserRole.CLIENT && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Eliminar Cuenta</h4>
                <p className="text-sm text-muted-foreground">
                  Eliminar permanentemente tu cuenta y todos los datos asociados
                </p>
              </div>
              <Button variant="destructive" onClick={() => console.log('Eliminar cuenta - pendiente')}>
                Eliminar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
