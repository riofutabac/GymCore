'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, UserPlus, UserCog } from 'lucide-react';
import { UserDataTable } from '@/components/modules/users/UserDataTable';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  gymId?: string;
}

export default function UsersPage() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'manager',
  });

  // Consulta para obtener todos los usuarios
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.getUsers(),
  });

  // Consulta para obtener todos los gimnasios (para asignar managers)
  const { data: gyms } = useQuery({
    queryKey: ['gyms'],
    queryFn: () => api.gyms.getGyms(),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.users.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        gymId: formData.role === 'manager' ? formData.gymId : undefined,
      });
      
      toast({
        title: 'Usuario creado',
        description: 'El usuario ha sido creado exitosamente',
      });
      
      // Limpiar formulario y refrescar lista
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'manager',
      });
      refetch();
    } catch (error) {
      console.error('Error al crear usuario:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el usuario',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users?.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Administra todos los usuarios del sistema
        </p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Nuevo Usuario
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>
                Aquí puedes ver y gestionar todos los usuarios del sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-24">
                  <p className="text-muted-foreground">Cargando usuarios...</p>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center h-24">
                  <p className="text-red-500">Error al cargar usuarios</p>
                </div>
              ) : (
                <UserDataTable data={filteredUsers} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Nuevo Usuario</CardTitle>
              <CardDescription>
                Crea un nuevo usuario para el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserDataTable 
                users={filteredUsers || []} 
                isLoading={isLoading} 
                error={error ? 'Error al cargar usuarios' : null}
                onRefresh={refetch}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Nuevo Usuario</CardTitle>
              <CardDescription>Crea un nuevo usuario en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value) => handleSelectChange('role', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="owner">Propietario</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="reception">Recepcionista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.role === 'manager' && (
                    <div className="space-y-2">
                      <Label htmlFor="gymId">Gimnasio asignado</Label>
                      <Select 
                        value={formData.gymId} 
                        onValueChange={(value) => handleSelectChange('gymId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un gimnasio" />
                        </SelectTrigger>
                        <SelectContent>
                          {gyms?.map(gym => (
                            <SelectItem key={gym.id} value={gym.id}>
                              {gym.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Crear Usuario
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}