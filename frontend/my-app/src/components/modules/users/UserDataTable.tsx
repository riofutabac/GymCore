'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Edit, UserCheck, UserX, KeyRound } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UserDataTableProps {
  data: User[];
  onEdit?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onResetPassword?: (user: User) => void;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export function UserDataTable({ 
  data = [], 
  onEdit, 
  onToggleStatus, 
  onResetPassword,
  isLoading, 
  error, 
  onRefresh 
}: UserDataTableProps) {
  // Definir columnas para la tabla
  const columns: ColumnDef<User, any>[] = [
    {
      accessorKey: 'name',
      header: 'Nombre',
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: ({ row }) => {
        const roleLabels: Record<string, string> = {
          OWNER: 'Propietario',
          MANAGER: 'Gerente',
          RECEPTION: 'Recepción',
          CLIENT: 'Cliente',
        };
        return roleLabels[row.original.role] || row.original.role;
      },
    },
    {
      accessorKey: 'isActive',
      header: 'Estado',
      cell: ({ row }) => (
        <span className={`rounded-full px-2 py-1 text-xs ${
          row.original.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.original.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
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
                      <UserX className="h-4 w-4 text-red-500" /> : 
                      <UserCheck className="h-4 w-4 text-green-500" />
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{row.original.isActive ? 'Desactivar' : 'Activar'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {onEdit && (
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
                  <p>Editar usuario</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {onResetPassword && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => onResetPassword(row.original)}
                  >
                    <KeyRound className="h-4 w-4 text-yellow-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Resetear contraseña</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <div className="py-10 text-center">Cargando usuarios...</div>;
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

  // Ensure data is always an array
  const safeData = Array.isArray(data) ? data : [];

  return (
    <DataTable
      columns={columns}
      data={safeData}
      searchColumn="name"
      searchPlaceholder="Buscar por nombre..."
    />
  );
}
