"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  Settings, 
  Database, 
  Mail, 
  Shield, 
  Bell,
  Palette,
  Globe,
  Save
} from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // General Settings
    systemName: "GymCore",
    systemEmail: "admin@gymcore.com",
    timezone: "America/New_York",
    language: "es",
    
    // Security Settings
    requireEmailVerification: true,
    enableTwoFactor: false,
    sessionTimeout: 30,
    passwordMinLength: 6,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Backup Settings
    autoBackup: true,
    backupFrequency: "daily",
    retentionDays: 30,
    
    // Theme Settings
    darkMode: false,
    primaryColor: "#3b82f6",
    
    // Maintenance
    maintenanceMode: false,
    maintenanceMessage: "Sistema en mantenimiento. Volveremos pronto."
  });

  const { toast } = useToast();

  const handleSave = () => {
    // Aquí iría la lógica para guardar la configuración
    toast({
      title: "Configuración guardada",
      description: "Los cambios se han aplicado correctamente",
    });
  };

  const handleBackup = () => {
    // Aquí iría la lógica para crear un backup manual
    toast({
      title: "Backup iniciado",
      description: "El respaldo se está creando en segundo plano",
    });
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
          <p className="text-muted-foreground">
            Administra la configuración global de GymCore
          </p>
        </div>
        
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Guardar Cambios
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración General
            </CardTitle>
            <CardDescription>
              Configuraciones básicas del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="systemName">Nombre del Sistema</Label>
              <Input
                id="systemName"
                value={settings.systemName}
                onChange={(e) => updateSetting('systemName', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="systemEmail">Email del Sistema</Label>
              <Input
                id="systemEmail"
                type="email"
                value={settings.systemEmail}
                onChange={(e) => updateSetting('systemEmail', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="timezone">Zona Horaria</Label>
              <select 
                id="timezone"
                className="w-full px-3 py-2 border rounded-md"
                value={settings.timezone}
                onChange={(e) => updateSetting('timezone', e.target.value)}
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Mexico_City">Mexico City</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="language">Idioma</Label>
              <select 
                id="language"
                className="w-full px-3 py-2 border rounded-md"
                value={settings.language}
                onChange={(e) => updateSetting('language', e.target.value)}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configuración de Seguridad
            </CardTitle>
            <CardDescription>
              Configuraciones de seguridad y autenticación
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Verificación de Email</Label>
                <p className="text-sm text-muted-foreground">
                  Requerir verificación de email para nuevos usuarios
                </p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => updateSetting('requireEmailVerification', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Autenticación de Dos Factores</Label>
                <p className="text-sm text-muted-foreground">
                  Habilitar 2FA para administradores
                </p>
              </div>
              <Switch
                checked={settings.enableTwoFactor}
                onCheckedChange={(checked) => updateSetting('enableTwoFactor', checked)}
              />
            </div>
            
            <Separator />
            
            <div>
              <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="passwordMinLength">Longitud Mínima de Contraseña</Label>
              <Input
                id="passwordMinLength"
                type="number"
                value={settings.passwordMinLength}
                onChange={(e) => updateSetting('passwordMinLength', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Configuración de Notificaciones
            </CardTitle>
            <CardDescription>
              Configurar tipos de notificaciones del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificaciones por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar notificaciones por correo electrónico
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificaciones por SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar notificaciones por mensaje de texto
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificaciones Push</Label>
                <p className="text-sm text-muted-foreground">
                  Enviar notificaciones push a dispositivos móviles
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configuración de Respaldos
            </CardTitle>
            <CardDescription>
              Configurar respaldos automáticos del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Respaldo Automático</Label>
                <p className="text-sm text-muted-foreground">
                  Crear respaldos automáticos de la base de datos
                </p>
              </div>
              <Switch
                checked={settings.autoBackup}
                onCheckedChange={(checked) => updateSetting('autoBackup', checked)}
              />
            </div>
            
            <div>
              <Label htmlFor="backupFrequency">Frecuencia de Respaldo</Label>
              <select 
                id="backupFrequency"
                className="w-full px-3 py-2 border rounded-md"
                value={settings.backupFrequency}
                onChange={(e) => updateSetting('backupFrequency', e.target.value)}
              >
                <option value="hourly">Cada hora</option>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensual</option>
              </select>
            </div>
            
            <div>
              <Label htmlFor="retentionDays">Días de Retención</Label>
              <Input
                id="retentionDays"
                type="number"
                value={settings.retentionDays}
                onChange={(e) => updateSetting('retentionDays', parseInt(e.target.value))}
              />
            </div>
            
            <Button onClick={handleBackup} variant="outline" className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Crear Respaldo Manual
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Maintenance Mode */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Modo de Mantenimiento
          </CardTitle>
          <CardDescription>
            Activar modo de mantenimiento para realizar actualizaciones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Modo de Mantenimiento</Label>
              <p className="text-sm text-muted-foreground">
                Desactivar temporalmente el acceso al sistema
              </p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
            />
          </div>
          
          {settings.maintenanceMode && (
            <div>
              <Label htmlFor="maintenanceMessage">Mensaje de Mantenimiento</Label>
              <Input
                id="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
                placeholder="Mensaje que verán los usuarios"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}