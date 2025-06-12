'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGymStore } from '@/lib/store';
import { Package, AlertTriangle, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  gymId: string;
}

export default function ManagerInventory() {
  const { currentGym } = useGymStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Aquí iría la llamada a la API para obtener los productos
        // Por ahora, simulamos que no hay productos
        setProducts([]);
      } catch (err) {
        console.error('Error al cargar productos:', err);
        setError('No se pudieron cargar los productos del inventario');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentGym?.id) {
      fetchProducts();
    } else {
      setError('No hay un gimnasio seleccionado');
      setIsLoading(false);
    }
  }, [currentGym]);

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">
            {currentGym ? `Gimnasio: ${currentGym.name}` : 'Seleccione un gimnasio'}
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Cargando inventario...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Aquí irían las tarjetas de productos */}
          <p>Lista de productos (implementación pendiente)</p>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay productos en el inventario</h3>
            <p className="text-muted-foreground mb-4">
              Comienza a registrar productos para tu gimnasio
            </p>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Agregar Primer Producto
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}