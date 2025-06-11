'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Gym } from '@/lib/types';
import { UserPlus, Save } from 'lucide-react';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  gymId?: string;
  isActive: boolean;
}

interface UserFormProps {
  initialData?: User | null;
  gyms: Gym[];
  onSubmit: (data: UserFormData) => Promise<void>;
  onCancel?: () => void;
}

export function UserForm({ initialData, gyms, onSubmit, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'MANAGER',
    gymId: '',
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  useEffect(() => {
    if (initialData) {
      console.log('Setting form data with initial data:', initialData);
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        password: '',
        confirmPassword: '',
        role: initialData.role || 'MANAGER',
        gymId: (initialData as any).workingAtGymId || '',
        isActive: initialData.isActive ?? true,
      });
    } else {
      // Reset form for new user
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'MANAGER',
        gymId: '',
        isActive: true,
      });
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditing && formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            disabled={isEditing}
          />
        </div>
        
        {!isEditing && (
          <>
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
          </>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="role">Rol</Label>
          <Select 
            value={formData.role} 
            onValueChange={(value: string) => handleSelectChange('role', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OWNER">Propietario</SelectItem>
              <SelectItem value="MANAGER">Gerente</SelectItem>
              <SelectItem value="RECEPTION">Recepcionista</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {(formData.role === 'MANAGER' || formData.role === 'RECEPTION') && (
          <div className="space-y-2">
            <Label htmlFor="gymId">Gimnasio asignado</Label>
            <Select 
              value={formData.gymId || ''} 
              onValueChange={(value: string) => handleSelectChange('gymId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un gimnasio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin asignar</SelectItem>
                {gyms?.map((gym: Gym) => (
                  <SelectItem key={gym.id} value={gym.id}>
                    {gym.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isEditing && (
          <div className="space-y-2">
            <Label htmlFor="isActive">Estado</Label>
            <Select 
              value={formData.isActive ? 'true' : 'false'} 
              onValueChange={(value: string) => handleSelectChange('isActive', value === 'true')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Activo</SelectItem>
                <SelectItem value="false">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
      
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
          {isEditing ? <Save className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {isSubmitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Usuario')}
        </Button>
      </div>
    </form>
  );
}
