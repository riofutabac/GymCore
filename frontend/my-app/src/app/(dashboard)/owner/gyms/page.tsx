'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Building, PlusCircle, Edit } from 'lucide-react';
import { GymDataTable } from '@/components/modules/gyms/GymDataTable';
import { GymForm } from '@/components/modules/gyms/GymForm';
import { Gym, CreateGymRequest, UpdateGymRequest } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

export default function GymsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  
  // Consulta para obtener todos los gimnasios
  const { data: gyms, isLoading, error, refetch } = useQuery({
    queryKey: ['gyms'],
    queryFn: () => api.gyms.getAll(),
  });

  const { data: selectedGym, isLoading: isLoadingSelectedGym } = useQuery({
    queryKey: ['gym', selectedGymId],
    queryFn: () => selectedGymId ? api.gyms.getById(selectedGymId) : null,
    enabled: !!selectedGymId,
  });

  const gymMutation = useMutation({
    mutationFn: async (gymData: { id?: string; data: CreateGymRequest | UpdateGymRequest }) => {
      if (gymData.id) {
        return api.gyms.update(gymData.id, gymData.data as UpdateGymRequest);
      }
      return api.gyms.create(gymData.data as CreateGymRequest);
    },
    onMutate: async () => {
      // Cancelar consultas en progreso para evitar conflictos
      await queryClient.cancelQueries({ queryKey: ['gyms'] });
    },
    onSuccess: (newGym, variables) => {
      // Actualización optimista inmediata
      queryClient.setQueryData(['gyms'], (oldGyms: Gym[] | undefined) => {
        if (!oldGyms) return [newGym];
        
        if (variables.id) {
          // Actualizar gimnasio existente
          return oldGyms.map(gym => gym.id === variables.id ? newGym : gym);
        } else {
          // Agregar nuevo gimnasio al inicio
          return [newGym, ...oldGyms];
        }
      });

      toast({
        title: `¡Éxito!`,
        description: `Gimnasio ${variables.id ? 'actualizado' : 'creado'} correctamente.`,
      });

      // Resetear estado inmediatamente
      setSelectedGymId(null);
      setActiveTab('list');
    },
    onError: (error: any, variables) => {
      // Revertir cambios optimistas en caso de error
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      
      toast({
        title: 'Error',
        description: `No se pudo ${variables.id ? 'actualizar' : 'crear'} el gimnasio: ${error.message}`,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      // Asegurar que los datos estén actualizados
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
    },
  });

  const handleSubmit = async (data: Partial<Gym>) => {
    // Base data for both create and update
    const baseData = {
      name: data.name!,
      address: data.address!,
      description: data.description,
      phone: data.phone,
      email: data.email,
    };
    
    // Only include isActive when updating
    const gymData = selectedGymId ? {
      ...baseData,
      isActive: data.isActive,
    } : baseData;
    
    gymMutation.mutate({ id: selectedGymId ?? undefined, data: gymData });
  };

  const handleEditGym = (gym: Gym) => {
    setSelectedGymId(gym.id);
    setActiveTab('edit');
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab !== 'edit') {
      setSelectedGymId(null);
    }
  };

  const handleNewGym = () => {
    setSelectedGymId(null);
    setActiveTab('new');
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Gimnasios</h1>
          <p className="text-muted-foreground">Administra todos los gimnasios de la red</p>
        </div>
        <Button onClick={handleNewGym} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Nuevo Gimnasio
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full md:w-[500px] grid-cols-3">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Gimnasios
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Nuevo Gimnasio
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex items-center gap-2" disabled={!selectedGymId}>
            <Edit className="h-4 w-4" />
            Editar Gimnasio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Gimnasios</CardTitle>
            </CardHeader>
            <CardContent>
              <GymDataTable
                data={gyms || []}
                isLoading={isLoading}
                error={error ? 'Error al cargar gimnasios' : null}
                onEdit={handleEditGym}
                onRefresh={refetch}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Nuevo Gimnasio</CardTitle>
            </CardHeader>
            <CardContent>
              <GymForm 
                onSubmit={handleSubmit} 
                isSubmitting={gymMutation.isPending} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="edit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Editar Gimnasio</CardTitle>
              <CardDescription>
                {selectedGym ? `Modificando: ${selectedGym.name}` : 'Cargando información del gimnasio...'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSelectedGym ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <GymForm 
                  initialData={selectedGym || undefined} 
                  onSubmit={handleSubmit}
                  isSubmitting={gymMutation.isPending}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}