"use client";

import POS from "@/components/POS";

export default function POSPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Punto de Venta</h1>
        <p className="text-muted-foreground">
          Sistema de ventas para productos del gimnasio
        </p>
      </div>

      {/* POS Component */}
      <POS />
    </div>
  );
}
