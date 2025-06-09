import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
<<<<<<< HEAD
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
=======
    <div className="flex justify-center items-center h-full min-h-[calc(100vh-200px)]">
      <div className="text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Cargando panel de recepción...</p>
>>>>>>> 28739750b0a193b14cb6da29461b7804589cba33
      </div>
    </div>
  );
}