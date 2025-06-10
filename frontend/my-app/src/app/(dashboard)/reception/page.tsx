'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QRValidator } from '@/components/modules/qr/QRValidator';
import { useGymStore } from '@/lib/store';
import { UserCheck, ShoppingCart } from 'lucide-react';

export default function ReceptionDashboard() {
  const { currentGym } = useGymStore();

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recepción</h1>
        <p className="text-muted-foreground">
          {currentGym ? `Gimnasio: ${currentGym.name}` : 'Seleccione un gimnasio'}
        </p>
      </div>

      <Tabs defaultValue="check-in" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="check-in" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Check-in
          </TabsTrigger>
          <TabsTrigger value="quick-sale" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Venta Rápida
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="check-in" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <QRValidator />
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Accesos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    <p>Lista de accesos recientes (implementación pendiente)</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="quick-sale" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Venta Rápida</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground">
                  Para realizar una venta completa, ve a la sección de
                  <a href="/reception/pos" className="text-primary hover:underline ml-1">
                    Punto de Venta
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}