'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Gym } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';

interface GymDataTableProps {
  data: Gym[];
  onEdit: (gym: Gym) => void;
  onToggleStatus?: (gym: Gym) => void;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export function GymDataTable({ data, onEdit, onToggleStatus, isLoading, error, onRefresh }: GymDataTableProps) {
  // Definir columnas para la tabla
  const columns: ColumnDef<Gym, any>[] = [
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
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEdit(row.original)}
          >
            Editar
          </Button>
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
    <DataTable
      columns={columns}
      data={data}
      searchColumn="name"
      searchPlaceholder="Buscar por nombre..."
    />
  );
}
