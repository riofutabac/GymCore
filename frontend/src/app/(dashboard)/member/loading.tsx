import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
<<<<<<< HEAD
    <div className="flex justify-center items-center h-full min-h-[calc(100vh-200px)] animate-fade-in">
      <div className="text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground animate-pulse">Cargando panel del socio...</p>
        <div className="mt-4 space-y-4 max-w-lg">
          <div className="grid grid-cols-4 gap-4">
            <div className="h-24 bg-gray-200 rounded-lg skeleton"></div>
            <div className="h-24 bg-gray-200 rounded-lg skeleton"></div>
            <div className="h-24 bg-gray-200 rounded-lg skeleton"></div>
            <div className="h-24 bg-gray-200 rounded-lg skeleton"></div>
          </div>
          <div className="h-32 bg-gray-200 rounded-lg skeleton"></div>
        </div>
=======
    <div className="flex justify-center items-center h-full min-h-[calc(100vh-200px)]">
      <div className="text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Cargando panel del socio...</p>
>>>>>>> 28739750b0a193b14cb6da29461b7804589cba33
      </div>
    </div>
  );
}