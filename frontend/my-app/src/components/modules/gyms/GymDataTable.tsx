'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gym } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Copy, Check, Trash2, Edit, Power, PowerOff } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
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

interface GymDataTableProps {
  data: Gym[];
  onEdit: (gym: Gym) => void;
  onToggleStatus?: (gym: Gym) => void;
  onDelete?: (gym: Gym) => void;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export function GymDataTable({ data, onEdit, onToggleStatus, isLoading, error, onRefresh }: GymDataTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [gymToDelete, setGymToDelete] = useState<Gym | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (gymId: string) => api.gyms.delete(gymId),
    onSuccess: () => {
      toast({ title: 'Gimnasio eliminado', description: 'El gimnasio ha sido eliminado exitosamente.' });
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error', 
        description: `No se pudo eliminar el gimnasio: ${error.message}`, 
        variant: 'destructive' 
      });
    },
    onSettled: () => {
      setGymToDelete(null);
    }
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };
  
  // Definir columnas para la tabla
  const columns: ColumnDef<Gym>[] = [
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      accessorKey: 'address',
      header: 'Dirección',
    },
    {
      accessorKey: 'phone',
      header: 'Teléfono',
      cell: ({ row }) => row.original.phone || 'N/A',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.original.email || 'N/A',
    },
    {
      accessorKey: 'isActive',
      header: 'Estado',
      cell: ({ row }) => (
        <span className={`rounded-full px-2 py-1 text-xs ${
          row.original.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.original.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      accessorKey: 'joinCode',
      header: 'Código de Acceso',
      cell: ({ row }) => {
        const joinCode = row.original.joinCode;
        if (!joinCode) return <span className="text-gray-400">No disponible</span>;
        
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2">
                  <span className="font-mono bg-gray-100 px-2 py-1 rounded">{joinCode}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6" 
                    onClick={() => handleCopyCode(joinCode)}
                  >
                    {copiedCode === joinCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copiedCode === joinCode ? 'Copiado!' : 'Copiar código'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          {onToggleStatus && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onToggleStatus(row.original)}
                  >
                    {row.original.isActive ? 
                      <PowerOff className="h-4 w-4 text-red-500" /> : 
                      <Power className="h-4 w-4 text-green-500" />
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{row.original.isActive ? 'Desactivar' : 'Activar'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => onEdit(row.original)}
                >
                  <Edit className="h-4 w-4 text-blue-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Editar gimnasio</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 hover:bg-red-50"
                  onClick={() => setGymToDelete(row.original)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eliminar gimnasio</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="py-10 text-center">Cargando gimnasios...</div>;
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            Reintentar
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchColumn="name"
        searchPlaceholder="Buscar por nombre..."
      />

      <AlertDialog open={!!gymToDelete} onOpenChange={() => setGymToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. Se eliminará el gimnasio "{gymToDelete?.name}" y todos sus datos asociados (miembros, ventas, productos, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (gymToDelete) {
                  deleteMutation.mutate(gymToDelete.id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Sí, eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
