'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, UserPlus, UserX } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useGymStore } from '@/lib/store';

interface StaffFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function StaffPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentGym } = useGymStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<StaffFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Consulta para obtener el personal del gimnasio actual
  const { data: staff, isLoading, error, refetch } = useQuery({
    queryKey: ['staff', currentGym?.id],
    queryFn: () => currentGym?.id ? api.users.getStaff(currentGym.id) : Promise.resolve([]),
    enabled: !!currentGym?.id,
  });

  // Mutación para crear un nuevo miembro del personal
  const createStaffMutation = useMutation({
    mutationFn: (staffData: StaffFormData & { gymId: string }) => {
      return api.users.createStaff(staffData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', currentGym?.id] });
      toast({
        title: 'Personal agregado',
        description: 'El miembro del personal ha sido agregado exitosamente',
      });
      // Limpiar formulario
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    },
    onError: (error) => {
      console.error('Error al crear personal:', error);
      toast({
        title: 'Error',
        description: 'No se pudo agregar al miembro del personal',
        variant: 'destructive',
      });
    },
  });

  // Mutación para desactivar un miembro del personal
  const toggleStaffStatusMutation = useMutation({
    mutationFn: ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return api.users.updateUserStatus(userId, isActive);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff', currentGym?.id] });
      toast({
        title: 'Estado actualizado',
        description: 'El estado del miembro del personal ha sido actualizado',
      });
    },
    onError: (error) => {
      console.error('Error al actualizar estado:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado del miembro del personal',
        variant: 'destructive',
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGym?.id) return;
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      });
      return;
    }
    
    createStaffMutation.mutate({
      ...formData,
      gymId: currentGym.id
    });
  };

  const handleToggleStatus = (userId: string, currentStatus: boolean) => {
    if (window.confirm(`¿Está seguro que desea ${currentStatus ? 'desactivar' : 'activar'} a este miembro del personal?`)) {
      toggleStaffStatusMutation.mutate({ userId, isActive: !currentStatus });
    }
  };

  const filteredStaff = staff?.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Personal</h1>
        <p className="text-muted-foreground">
          {currentGym ? `Gimnasio: ${currentGym.name}` : 'Seleccione un gimnasio'}
        </p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Nuevo Personal
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Personal</CardTitle>
              <CardDescription>Gestiona el personal de recepción de tu gimnasio</CardDescription>
              <div className="mt-2">
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Cargando personal...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">Error al cargar personal</div>
              ) : filteredStaff?.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {searchTerm ? 'No se encontraron miembros del personal con ese criterio' : 'No hay personal registrado'}
                </div>
              ) : (
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">Nombre</th>
                        <th className="p-2 text-left font-medium">Email</th>
                        <th className="p-2 text-left font-medium">Estado</th>
                        <th className="p-2 text-left font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStaff?.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">{user.name}</td>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">
                            <span className={`rounded-full px-2 py-1 text-xs ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {user.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleToggleStatus(user.id, user.isActive)}
                                className={user.isActive ? 'text-red-600' : 'text-green-600'}
                              >
                                {user.isActive ? 'Desactivar' : 'Activar'}
                              </Button>
                              <Button variant="outline" size="sm">
                                Resetear Contraseña
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Nuevo Personal</CardTitle>
              <CardDescription>Agrega un nuevo miembro del personal de recepción</CardDescription>
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
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit" className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Agregar Personal
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