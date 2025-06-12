'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gym } from '@/lib/types';

interface GymFormProps {
  initialData?: Gym;
  onSubmit: (data: Partial<Gym>) => Promise<void>;
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
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.name.trim() || !formData.address.trim()) {
      return;
    }
    
    try {
      await onSubmit(formData);
      
      // Solo limpiar el formulario si es creación (no edición)
      if (!initialData) {
        setFormData({
          name: '',
          address: '',
          phone: '',
          email: '',
          description: '',
          isActive: true,
        });
      }
    } catch (error) {
      // El error se maneja en el componente padre
      console.error('Error in form submission:', error);
    }
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={isSubmitting}
              />
            </div>
            {initialData && (
              <div className="flex items-center space-x-2">
                <Switch 
                  id="isActive" 
                  checked={formData.isActive} 
                  onCheckedChange={handleSwitchChange}
                  disabled={isSubmitting}
                />
                <Label htmlFor="isActive">Activo</Label>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.name.trim() || !formData.address.trim()} 
              variant={initialData ? "outline" : "default"}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                initialData ? 'Guardar Cambios' : 'Crear Gimnasio'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
