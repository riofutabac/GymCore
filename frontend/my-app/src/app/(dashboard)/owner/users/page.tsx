'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Users, UserPlus, Edit } from 'lucide-react';
import { UserDataTable } from '@/components/modules/users/UserDataTable';
import { UserForm } from '@/components/modules/users/UserForm';
import { useToast } from '@/components/ui/use-toast';
import { User, Gym } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function UsersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('list');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToToggle, setUserToToggle] = useState<User | null>(null);

  // Consulta para obtener todos los usuarios
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.users.getAll(),
  });

  // Consulta para obtener todos los gimnasios
  const { data: gyms } = useQuery({
    queryKey: ['gyms'],
    queryFn: () => api.gyms.getAll(),
  });

  const createUserMutation = useMutation({
    mutationFn: (userData: any) => api.users.createUser(userData),
    onSuccess: () => {
      toast({ title: 'Usuario creado', description: 'El usuario ha sido creado exitosamente' });
      setActiveTab('list');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: `No se pudo crear el usuario: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      console.log('Mutation: toggling user status', id, isActive);
      return api.users.updateUserStatus(id, isActive);
    },
    onSuccess: (data) => {
      console.log('User status updated successfully:', data);
      toast({ title: 'Estado actualizado', description: 'El estado del usuario ha sido actualizado exitosamente' });
      // Forzar actualización inmediata
      queryClient.setQueryData(['users'], (oldData: User[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(user => 
          user.id === data.id ? { ...user, isActive: data.isActive } : user
        );
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('Error updating user status:', error);
      toast({ 
        title: 'Error', 
        description: `No se pudo actualizar el estado: ${error.message}`, 
        variant: 'destructive' 
      });
    },
    onSettled: () => {
      setUserToToggle(null);
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, userData }: { id: string; userData: any }) => {
      console.log('Mutation: updating user', id, userData);
      return api.users.updateUser(id, userData);
    },
    onSuccess: (data) => {
      console.log('User updated successfully:', data);
      toast({ title: 'Usuario actualizado', description: 'El usuario ha sido actualizado exitosamente' });
      setActiveTab('list');
      setSelectedUser(null);
      // Forzar actualización inmediata
      queryClient.setQueryData(['users'], (oldData: User[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(user => 
          user.id === data.id ? { ...user, ...data } : user
        );
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      toast({ 
        title: 'Error', 
        description: `No se pudo actualizar el usuario: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  });

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setActiveTab('edit');
  };

  const handleToggleStatus = (user: User) => {
    setUserToToggle(user);
  };

  const handleResetPassword = async (user: User) => {
    try {
      await api.users.resetPassword(user.id);
      toast({ title: 'Contraseña reseteada', description: 'Se ha enviado un email para resetear la contraseña' });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: `No se pudo resetear la contraseña: ${error.message}`, 
        variant: 'destructive' 
      });
    }
  };

  const handleFormSubmit = async (formData: any) => {
    if (selectedUser) {
      updateUserMutation.mutate({ id: selectedUser.id, userData: formData });
    } else {
      createUserMutation.mutate(formData);
    }
  };

  const handleNewUser = () => {
    setSelectedUser(null);
    setActiveTab('new');
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">
          Administra todos los usuarios del sistema
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-[600px] grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2" onClick={handleNewUser}>
            <UserPlus className="h-4 w-4" />
            Nuevo Usuario
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2" disabled={!selectedUser}>
            <Edit className="h-4 w-4" />
            Editar Usuario
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Usuarios</CardTitle>
              <CardDescription>Gestiona todos los usuarios del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <UserDataTable 
                data={users || []} 
                isLoading={isLoading} 
                error={error ? 'Error al cargar usuarios' : null}
                onRefresh={refetch}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatus}
                onResetPassword={handleResetPassword}
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
              <UserForm
                gyms={gyms || []}
                onSubmit={handleFormSubmit}
                onCancel={() => setActiveTab('list')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Editar Usuario</CardTitle>
              <CardDescription>
                {selectedUser ? `Modificando perfil de ${selectedUser.name}` : 'Editando usuario'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UserForm
                key={selectedUser?.id}
                initialData={selectedUser}
                gyms={gyms || []}
                onSubmit={handleFormSubmit}
                onCancel={() => setActiveTab('list')}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!userToToggle} onOpenChange={() => setUserToToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              {userToToggle?.isActive 
                ? `Vas a desactivar al usuario "${userToToggle?.name}". No podrá acceder al sistema.`
                : `Vas a activar al usuario "${userToToggle?.name}". Podrá acceder al sistema nuevamente.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (userToToggle) {
                  toggleStatusMutation.mutate({ 
                    id: userToToggle.id, 
                    isActive: !userToToggle.isActive 
                  });
                }
              }}
              disabled={toggleStatusMutation.isPending}
            >
              {toggleStatusMutation.isPending ? 'Procesando...' : 'Sí, continuar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}