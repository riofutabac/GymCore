'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { User } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';

interface UserDataTableProps {
  data: User[];
  onEdit?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
  onResetPassword?: (user: User) => void;
}

export function UserDataTable({ 
  data, 
  onEdit, 
  onToggleStatus, 
  onResetPassword 
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
          row.original.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.original.isActive ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          {onToggleStatus && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onToggleStatus(row.original)}
            >
              {row.original.isActive ? 'Desactivar' : 'Activar'}
            </Button>
          )}
          {onEdit && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(row.original)}
            >
              Editar
            </Button>
          )}
          {onResetPassword && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onResetPassword(row.original)}
            >
              Reset Password
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchColumn="name"
      searchPlaceholder="Buscar por nombre o email..."
    />
  );
}
