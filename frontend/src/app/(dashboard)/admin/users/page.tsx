"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  Filter,
  UserCheck,
  UserX,
  Crown,
  Shield
} from "lucide-react";
import { authAPI } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  memberOfGym?: {
    name: string;
  };
  staffOfGym?: {
    name: string;
  };
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    phone: "",
    role: "CLIENT",
    password: "password123"
  });
  const { toast } = useToast();

  // Datos simulados para demostración
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Simulamos datos de usuarios
      const mockUsers: User[] = [
        {
          id: "1",
          email: "owner@gym.com",
          name: "Propietario Gym",
          role: "SYS_ADMIN",
          isActive: true,
          emailVerified: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          email: "admin@gym.com",
          name: "Manager Demo",
          role: "MANAGER",
          isActive: true,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          staffOfGym: { name: "GymCore Demo" }
        },
        {
          id: "3",
          email: "reception@gym.com",
          name: "Recepcionista Demo",
          role: "RECEPTION",
          isActive: true,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          staffOfGym: { name: "GymCore Demo" }
        },
        {
          id: "4",
          email: "client@gym.com",
          name: "Cliente Demo",
          role: "CLIENT",
          isActive: true,
          emailVerified: true,
          createdAt: new Date().toISOString(),
          memberOfGym: { name: "GymCore Demo" }
        }
      ];
      
      setUsers(mockUsers);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los usuarios",
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    try {
      // FIX: Llamar a la API para crear el usuario
      const response = await authAPI.register(newUser.email, newUser.password, newUser.name);
      
      // Agregar el nuevo usuario a la lista local
      const newUserData = {
        ...newUser,
        id: response.user.id,
        isActive: true,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      };
      
      setUsers([...users, newUserData as User]);
      
      toast({
        title: "Usuario creado",
        description: "El usuario se ha creado correctamente en la base de datos",
      });
      
      setIsCreateDialogOpen(false);
      setNewUser({
        email: "",
        name: "",
        phone: "",
        role: "CLIENT",
        password: "password123"
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al crear usuario",
      });
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isActive: !user.isActive }
          : user
      ));
      
      toast({
        title: "Estado actualizado",
        description: "El estado del usuario se ha actualizado",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al actualizar el estado del usuario",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "all" || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SYS_ADMIN': return <Crown className="h-4 w-4" />;
      case 'MANAGER': return <Shield className="h-4 w-4" />;
      case 'RECEPTION': return <UserCheck className="h-4 w-4" />;
      case 'CLIENT': return <Users className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SYS_ADMIN': return 'bg-purple-500';
      case 'MANAGER': return 'bg-blue-500';
      case 'RECEPTION': return 'bg-green-500';
      case 'CLIENT': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'SYS_ADMIN': return 'Administrador';
      case 'MANAGER': return 'Gerente';
      case 'RECEPTION': return 'Recepción';
      case 'CLIENT': return 'Cliente';
      default: return role;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
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
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">
            Administra usuarios y asigna roles en el sistema
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Crea un nuevo usuario en el sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="usuario@ejemplo.com"
                />
              </div>
              
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Nombre completo"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  placeholder="+1 234 567 8900"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Rol</Label>
                <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">Cliente</SelectItem>
                    <SelectItem value="RECEPTION">Recepción</SelectItem>
                    <SelectItem value="MANAGER">Gerente</SelectItem>
                    <SelectItem value="SYS_ADMIN">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Contraseña temporal"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={createUser} disabled={!newUser.email}>
                  Crear Usuario
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
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.isActive).length} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'CLIENT').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Socios del gimnasio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personal</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => ['MANAGER', 'RECEPTION'].includes(u.role)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Staff del gimnasio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'SYS_ADMIN').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Acceso completo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="CLIENT">Clientes</SelectItem>
                <SelectItem value="RECEPTION">Recepción</SelectItem>
                <SelectItem value="MANAGER">Gerentes</SelectItem>
                <SelectItem value="SYS_ADMIN">Administradores</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{user.name || user.email}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded ${getRoleColor(user.role)} text-white`}>
                  {getRoleIcon(user.role)}
                </div>
                <span className="font-medium">{getRoleText(user.role)}</span>
              </div>
              
              {user.phone && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Teléfono: </span>
                  <span>{user.phone}</span>
                </div>
              )}
              
              {(user.memberOfGym || user.staffOfGym) && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Gimnasio: </span>
                  <span>{user.memberOfGym?.name || user.staffOfGym?.name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Email verificado:</span>
                {user.emailVerified ? (
                  <UserCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <UserX className="h-4 w-4 text-red-500" />
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button 
                  variant={user.isActive ? "destructive" : "default"}
                  size="sm" 
                  className="flex-1"
                  onClick={() => toggleUserStatus(user.id)}
                >
                  {user.isActive ? (
                    <>
                      <UserX className="h-3 w-3 mr-1" />
                      Desactivar
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3 w-3 mr-1" />
                      Activar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32">
            <Users className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              No se encontraron usuarios con los filtros aplicados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}