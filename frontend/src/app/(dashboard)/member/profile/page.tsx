"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Save,
  Camera,
  Shield
} from "lucide-react";

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  avatarUrl?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // Obtener datos del usuario desde localStorage
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        const mockProfile: UserProfile = {
          id: user.id,
          email: user.email,
          name: user.name || "",
          phone: "+1 234 567 8900", // Datos simulados
          role: user.role,
          isActive: true,
          emailVerified: true,
          createdAt: new Date().toISOString(),
        };
        
        setProfile(mockProfile);
        setFormData({
          name: mockProfile.name || "",
          phone: mockProfile.phone || "",
          email: mockProfile.email
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el perfil",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Aquí iría la llamada a la API para actualizar el perfil
      if (profile) {
        const updatedProfile = {
          ...profile,
          name: formData.name,
          phone: formData.phone,
          email: formData.email
        };
        
        setProfile(updatedProfile);
        
        // Actualizar también en localStorage
        const userData = localStorage.getItem("user");
        if (userData) {
          const user = JSON.parse(userData);
          user.name = formData.name;
          user.email = formData.email;
          localStorage.setItem("user", JSON.stringify(user));
        }
      }
      
      setEditing(false);
      
      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado correctamente",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el perfil",
      });
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        email: profile.email
      });
    }
    setEditing(false);
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'CLIENT': return 'Cliente';
      case 'RECEPTION': return 'Recepción';
      case 'MANAGER': return 'Gerente';
      case 'SYS_ADMIN': return 'Administrador';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'CLIENT': return 'bg-blue-500';
      case 'RECEPTION': return 'bg-green-500';
      case 'MANAGER': return 'bg-purple-500';
      case 'SYS_ADMIN': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32">
            <User className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No se pudo cargar la información del perfil
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userInitials = profile.name?.split(' ').map(n => n[0]).join('') || profile.email.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">
            Gestiona tu información personal y configuración de cuenta
          </p>
        </div>
        
        {!editing ? (
          <Button onClick={() => setEditing(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
            <CardDescription>
              Tu información básica y estado de cuenta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold text-lg">{profile.name || "Sin nombre"}</h3>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            <Separator />

            {/* Role and Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rol:</span>
                <Badge className={getRoleColor(profile.role)}>
                  {getRoleText(profile.role)}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estado:</span>
                <Badge variant={profile.isActive ? 'default' : 'secondary'}>
                  {profile.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email verificado:</span>
                <Badge variant={profile.emailVerified ? 'default' : 'destructive'}>
                  {profile.emailVerified ? 'Verificado' : 'Pendiente'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Miembro desde:</span>
                <span className="text-sm">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detalles de la Cuenta</CardTitle>
            <CardDescription>
              {editing ? "Edita tu información personal" : "Tu información personal"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                {editing ? (
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Tu nombre completo"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.name || "No especificado"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                {editing ? (
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="tu@email.com"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                {editing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+1 234 567 8900"
                  />
                ) : (
                  <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.phone || "No especificado"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Fecha de registro</Label>
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {!editing && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Configuración de Seguridad
                </h4>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    Cambiar contraseña
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Configurar autenticación de dos factores
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    Descargar datos de la cuenta
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}