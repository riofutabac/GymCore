'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gym, User } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface GymFormProps {
  initialData?: Gym;
  onSubmit: (data: Partial<Gym> & { managerId?: string | null }) => Promise<void>;
  isSubmitting: boolean;
}

export function GymForm({ initialData, onSubmit, isSubmitting }: GymFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    isActive: true,
    managerId: 'unassigned', // Usar 'unassigned' como valor por defecto en lugar de cadena vacía
  });

  // Obtener gerentes disponibles
  const { data: availableManagers, isLoading: loadingManagers } = useQuery({
    queryKey: ['available-managers'],
    queryFn: api.gyms.getAvailableManagers,
  });

  // Cargar datos iniciales si se está editando un gimnasio existente
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        email: initialData.email || '',
        description: initialData.description || '',
        isActive: initialData.isActive ?? true,
        managerId: (initialData as any).managerId || 'unassigned',
      });
    } else {
      // Reset form when switching to create mode
      setFormData({
        name: '',
        address: '',
        phone: '',
        email: '',
        description: '',
        isActive: true,
        managerId: 'unassigned',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      managerId: formData.managerId === 'unassigned' ? null : formData.managerId,
    };
    await onSubmit(submitData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Editar Gimnasio' : 'Crear Nuevo Gimnasio'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="managerId">Gerente Asignado</Label>
              <Select 
                value={formData.managerId} 
                onValueChange={(value) => handleSelectChange('managerId', value)}
                disabled={loadingManagers}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar gerente (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Sin gerente asignado</SelectItem>
                  {availableManagers?.map((manager: User) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name} ({manager.email})
                    </SelectItem>
                  ))}
                  {/* Si está editando y tiene gerente actual, mostrarlo aunque no esté en disponibles */}
                  {initialData && 
                   (initialData as any).manager && 
                   !availableManagers?.find(m => m.id === (initialData as any).managerId) && 
                   (initialData as any).managerId !== 'unassigned' && (
                    <SelectItem value={(initialData as any).managerId}>
                      {(initialData as any).manager.name} ({(initialData as any).manager.email}) - Actual
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {loadingManagers && <p className="text-sm text-gray-500">Cargando gerentes...</p>}
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            {initialData && (
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isActive" 
                  checked={formData.isActive} 
                  onCheckedChange={handleSwitchChange} 
                />
                <Label htmlFor="isActive">Activo</Label>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={isSubmitting} variant={initialData ? "outline" : "default"}>
              {isSubmitting ? 'Guardando...' : (initialData ? 'Guardar Cambios' : 'Crear Gimnasio')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
