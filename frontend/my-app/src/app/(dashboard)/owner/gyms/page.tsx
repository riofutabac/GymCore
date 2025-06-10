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

export default function GymsPage() {
  const [selectedGymId, setSelectedGymId] = useState<string | null>(null);
  
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
  };

  const handleGymUpdated = () => {
    refetch();
    setSelectedGymId(null);
  };

  const handleEditGym = (gymId: string) => {
    setSelectedGymId(gymId);
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Gimnasios</h1>
        <p className="text-muted-foreground">
          Administra todos los gimnasios de la red
        </p>
      </div>

      <Tabs defaultValue={selectedGymId ? "edit" : "list"} className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger 
            value="list" 
            className="flex items-center gap-2"
            onClick={() => setSelectedGymId(null)}
          >
            <Building className="h-4 w-4" />
            Gimnasios
          </TabsTrigger>
          <TabsTrigger 
            value="edit" 
            className="flex items-center gap-2"
            disabled={!selectedGymId}
          >
            <PlusCircle className="h-4 w-4" />
            {selectedGymId ? 'Editar Gimnasio' : 'Nuevo Gimnasio'}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Gimnasios</CardTitle>
              <CardDescription>Gestiona todos los gimnasios de la red</CardDescription>
              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    setSelectedGymId(null);
                    document.querySelector('[data-value="edit"]')?.dispatchEvent(
                      new MouseEvent('click', { bubbles: true })
                    );
                  }}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Nuevo Gimnasio
                </Button>
              </div>
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
        
        <TabsContent value="edit" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>{selectedGymId ? 'Editar Gimnasio' : 'Nuevo Gimnasio'}</CardTitle>
              <CardDescription>
                {selectedGymId ? 'Modifica la información del gimnasio' : 'Registra un nuevo gimnasio en el sistema'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GymForm 
                gym={selectedGym} 
                onSuccess={selectedGymId ? handleGymUpdated : handleGymCreated}
                onCancel={() => {
                  setSelectedGymId(null);
                  document.querySelector('[data-value="list"]')?.dispatchEvent(
                    new MouseEvent('click', { bubbles: true })
                  );
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}