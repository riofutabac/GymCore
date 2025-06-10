'use client';

import React from 'react';
import { PointOfSale } from '@/components/modules/pos/PointOfSale';
import { useGymStore } from '@/lib/store';

export default function POSPage() {
  const { currentGym } = useGymStore();

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Punto de Venta</h1>
        <p className="text-muted-foreground">
          {currentGym ? `Gimnasio: ${currentGym.name}` : 'Seleccione un gimnasio'}
        </p>
      </div>
      
      <PointOfSale />
    </div>
  );
}