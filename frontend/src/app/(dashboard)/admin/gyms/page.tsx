"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { 
  Building, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  MapPin,
  Phone,
  Mail
} from "lucide-react";
import { gymsAPI } from "@/lib/api";

interface Gym {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  joinCode: string;
  isActive: boolean;
  _count?: {
    members: number;
    staff: number;
  };
  createdAt: string;
}

export default function GymsManagementPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGym, setNewGym] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    loadGyms();
  }, []);

  const loadGyms = async () => {
    try {
      const response = await gymsAPI.getAll();
      setGyms(response.data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los gimnasios",
      });
    } finally {
      setLoading(false);
    }
  };

  const createGym = async () => {
    try {
      await gymsAPI.create(newGym);
      
      toast({
        title: "Gimnasio creado",
        description: "El gimnasio se ha creado correctamente",
      });
      
      setIsCreateDialogOpen(false);
      setNewGym({
        name: "",
        address: "",
        phone: "",
        email: "",
        description: ""
      });
      
      await loadGyms();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al crear gimnasio",
      });
    }
  };

  const deleteGym = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este gimnasio?")) {
      return;
    }

    try {
      await gymsAPI.delete(id);
      
      toast({
        title: "Gimnasio eliminado",
        description: "El gimnasio se ha eliminado correctamente",
      });
      
      await loadGyms();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al eliminar gimnasio",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Gimnasios</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Gimnasios</h1>
          <p className="text-muted-foreground">
            Administra todos los gimnasios del sistema
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Gimnasio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Gimnasio</DialogTitle>
              <DialogDescription>
                Crea un nuevo gimnasio en el sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={newGym.name}
                  onChange={(e) => setNewGym({...newGym, name: e.target.value})}
                  placeholder="Nombre del gimnasio"
                />
              </div>
              
              <div>
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={newGym.address}
                  onChange={(e) => setNewGym({...newGym, address: e.target.value})}
                  placeholder="Dirección completa"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    value={newGym.phone}
                    onChange={(e) => setNewGym({...newGym, phone: e.target.value})}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newGym.email}
                    onChange={(e) => setNewGym({...newGym, email: e.target.value})}
                    placeholder="info@gimnasio.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Input
                  id="description"
                  value={newGym.description}
                  onChange={(e) => setNewGym({...newGym, description: e.target.value})}
                  placeholder="Descripción del gimnasio"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createGym} disabled={!newGym.name}>
                  Crear Gimnasio
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gimnasios</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gyms.length}</div>
            <p className="text-xs text-muted-foreground">
              {gyms.filter(g => g.isActive).length} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Miembros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gyms.reduce((sum, gym) => sum + (gym._count?.members || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Todos los gimnasios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {gyms.reduce((sum, gym) => sum + (gym._count?.staff || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Staff de todos los gimnasios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gimnasios Activos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {gyms.filter(g => g.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              En funcionamiento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gyms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gyms.map((gym) => (
          <Card key={gym.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{gym.name}</CardTitle>
                  <CardDescription>Código: {gym.joinCode}</CardDescription>
                </div>
                <Badge variant={gym.isActive ? 'default' : 'secondary'}>
                  {gym.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {gym.address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{gym.address}</span>
                </div>
              )}
              
              {gym.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{gym.phone}</span>
                </div>
              )}
              
              {gym.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{gym.email}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Miembros:</p>
                  <p className="font-medium">{gym._count?.members || 0}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Personal:</p>
                  <p className="font-medium">{gym._count?.staff || 0}</p>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => deleteGym(gym.id)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {gyms.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32">
            <Building className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No hay gimnasios registrados en el sistema
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}