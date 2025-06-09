import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-full min-h-[calc(100vh-200px)] animate-fade-in">
      <div className="text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground animate-pulse">
          Cargando panel de recepción...
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4 max-w-md">
          <div className="h-20 bg-gray-200 rounded-lg skeleton"></div>
          <div className="h-20 bg-gray-200 rounded-lg skeleton"></div>
          <div className="h-20 bg-gray-200 rounded-lg skeleton"></div>
        </div>
      </div>
    </div>
  );
}