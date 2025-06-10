'use client';

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { gymsAPI, usersAPI } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { Plus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/lib/types";

interface CreateGymDialogProps {
  children?: React.ReactNode;
}

export function CreateGymDialog({ children }: CreateGymDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);
  const [loadingManagers, setLoadingManagers] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    phone: '',
    email: '',
    isActive: true,
    managerId: '',
  });

  const router = useRouter();
  const { toast } = useToast();

  const loadManagers = useCallback(async () => {
    setLoadingManagers(true);
    try {
      const response = await usersAPI.getByRole('MANAGER');
      setManagers(response);
    } catch (error) {
      console.error('Error al cargar gerentes:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudieron cargar los gerentes disponibles',
      });
    } finally {
      setLoadingManagers(false);
    }
  }, [toast]);

  // Cargar gerentes disponibles cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      loadManagers();
    }
  }, [open, loadManagers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Verificar autenticación
    const token = localStorage.getItem('gymcore_token');
    const user = getUser();
    
    if (!token || !user) {
      toast({
        variant: 'destructive',
        title: 'Error de autenticación',
        description: 'Debes iniciar sesión para crear un gimnasio.',
      });
      setLoading(false);
      return;
    }
    
    console.log('Usuario autenticado:', user.email, 'Role:', user.role);
    
    // Datos que se enviarán al backend
    const payload = {
      ...formData,
      ownerId: user.id // Incluir el ID del usuario como propietario
    };
    
    console.log('Enviando datos al backend:', payload);

    try {
      await gymsAPI.create(payload);

      toast({
        title: 'Gimnasio creado',
        description: `${formData.name} ha sido creado exitosamente`,
      });

      setOpen(false);
      setFormData({
        name: '',
        address: '',
        description: '',
        phone: '',
        email: '',
        isActive: true,
        managerId: '',
      });
      router.refresh();
    } catch (error) {
      console.error('Error creating gym:', error);
      const errorMessage = error instanceof Error ? error.message :
        // @ts-expect-error - Error handling for any type of error
        error.response?.data?.message || 'Error al crear el gimnasio';
      
      // Mostrar detalles completos del error
      console.error('Error details:', {
        formData,
        error: errorMessage,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        fullResponse: JSON.stringify(error.response?.data),
        authHeader: error.config?.headers?.Authorization ? 'Present' : 'Missing',
      });
      
      // Manejar diferentes tipos de errores
      if (error.response?.status === 401 || error.response?.data?.message?.includes('unauthorized')) {
        toast({
          variant: 'destructive',
          title: 'Error de autenticación',
          description: 'No tienes permiso para crear gimnasios. Inicia sesión nuevamente.',
        });
        // Redirigir al login si es un problema de autenticación
        router.push('/login');
        return;
      } else if (error.response?.data?.message?.includes('already owns')) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Ya eres propietario de un gimnasio. No puedes crear otro.',
        });
        return;
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: string | number | boolean } }
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Crear Gimnasio
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Gimnasio</DialogTitle>
            <DialogDescription>
              Ingresa los datos del nuevo gimnasio que será agregado al sistema.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Dirección
              </Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="col-span-3"
                required
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Teléfono
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="col-span-3"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="col-span-3"
                disabled={loading}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="managerId" className="text-right">
                Gerente
              </Label>
              <div className="col-span-3">
                <Select 
                  value={formData.managerId} 
                  onValueChange={(value) => setFormData({...formData, managerId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un gerente" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingManagers ? (
                      <div className="flex items-center justify-center p-2">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Cargando gerentes...</span>
                      </div>
                    ) : managers.length > 0 ? (
                      managers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id}>
                          {manager.name} ({manager.email})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">
                        No hay gerentes disponibles
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Activo
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  name="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleChange({ target: { name: 'isActive', value: checked } })}
                  disabled={loading}
                />
                <Label>{formData.isActive ? 'Activo' : 'Inactivo'}</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Gimnasio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
