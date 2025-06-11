'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Building, PlusCircle } from 'lucide-react';
import { GymDataTable } from '@/components/modules/gyms/GymDataTable';
import { GymForm } from '@/components/modules/gyms/GymForm';
import { Gym, CreateGymRequest } from '@/lib/types';

export default function GymsPage() {
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Consulta para obtener todos los gimnasios
  const { data: gyms, isLoading, error, refetch } = useQuery({
    queryKey: ['gyms'],
    queryFn: () => api.gyms.getAll(),
  });

  // Consulta para obtener un gimnasio específico cuando se selecciona para editar
  const { data: selectedGym } = useQuery({
    queryKey: ['gym', selectedGymId],
    queryFn: () => selectedGymId ? api.gyms.getById(selectedGymId) : null,
    enabled: !!selectedGymId,
  });

  const handleGymCreated = () => {
    refetch();
    setActiveTab('list');
    setSelectedGymId(null);
  };

  const handleGymUpdated = () => {
    refetch();
    setActiveTab('list'); 
    setSelectedGymId(null);
  };
  
  const handleEditGym = (gym: Gym) => {
    setSelectedGymId(gym.id);
    setActiveTab('edit');
  };  const handleSubmitGym = async (data: Partial<Gym>) => {
    setIsSubmitting(true);
    try {
      // Convertir datos del formulario al formato correcto de la API
      const gymData = {
        name: data.name || '',
        address: data.address || '',
        description: data.description,
        phone: data.phone,
        email: data.email,
        isActive: data.isActive
      };
      
      if (selectedGymId) {
        // Editando un gimnasio existente
        await api.gyms.update(selectedGymId, gymData);
        handleGymUpdated();
      } else {
        // Creando un nuevo gimnasio
        if (!gymData.name || !gymData.address) {
          throw new Error('Nombre y dirección son requeridos');
        }
        await api.gyms.create(gymData as CreateGymRequest);
        handleGymCreated();
      }
    } catch (error) {
      console.error('Error saving gym:', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Gimnasios</h1>
        <p className="text-muted-foreground">
          Administra todos los gimnasios de la red
        </p>
      </div>      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-[500px] grid-cols-3">
          <TabsTrigger 
            value="list" 
            className="flex items-center gap-2"
          >
            <Building className="h-4 w-4" />
            Gimnasios
          </TabsTrigger>
          <TabsTrigger 
            value="new" 
            className="flex items-center gap-2"
            onClick={() => setSelectedGymId(null)}
          >
            <PlusCircle className="h-4 w-4" />
            Nuevo Gimnasio
          </TabsTrigger>
          <TabsTrigger 
            value="edit" 
            className="flex items-center gap-2"
            disabled={!selectedGymId}
          >
            <PlusCircle className="h-4 w-4" />
            Editar Gimnasio
          </TabsTrigger>
        </TabsList>
          <TabsContent value="list" className="mt-6">
          <Card>            <CardHeader>
              <CardTitle>Lista de Gimnasios</CardTitle>
              <CardDescription>Gestiona todos los gimnasios de la red</CardDescription>
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
              <CardDescription>
                Registra un nuevo gimnasio en el sistema
              </CardDescription>
            </CardHeader>
            <CardContent>              <GymForm 
                initialData={undefined} 
                onSubmit={handleSubmitGym}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="edit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Editar Gimnasio</CardTitle>
              <CardDescription>
                Modifica la información del gimnasio seleccionado
              </CardDescription>
            </CardHeader>
            <CardContent>              <GymForm 
                initialData={selectedGym || undefined} 
                onSubmit={handleSubmitGym}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}