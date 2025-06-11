'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gym } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Copy, Check } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GymDataTableProps {
  data: Gym[];
  onEdit: (gym: Gym) => void;
  onToggleStatus?: (gym: Gym) => void;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export function GymDataTable({ data, onEdit, onToggleStatus, isLoading, error, onRefresh }: GymDataTableProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };
  
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
