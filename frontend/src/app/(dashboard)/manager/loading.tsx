import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex justify-center items-center h-full min-h-[calc(100vh-200px)]">
      <div className="text-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Cargando panel del gerente...</p>
      </div>
    </div>
  );
}