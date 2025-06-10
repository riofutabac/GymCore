
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Edit, Trash2, Copy } from 'lucide-react';
import { EditGymDialog } from './EditGymDialog';
import { Gym } from '@/lib/types';
import { gymsAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface GymActionsProps {
  gym: Gym;
}

export function GymActions({ gym }: GymActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const handleCopyJoinCode = async () => {
    try {
      await navigator.clipboard.writeText(gym.joinCode);
      toast({
        title: 'Código copiado',
        description: 'El código de acceso ha sido copiado al portapapeles',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No se pudo copiar el código',
      });
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await gymsAPI.delete(gym.id);
      toast({
        title: 'Gimnasio eliminado',
        description: `${gym.name} ha sido eliminado exitosamente`,
      });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al eliminar el gimnasio',
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleCopyJoinCode}>
            <Copy className="mr-2 h-4 w-4" />
            Copiar código
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <EditGymDialog
              gym={gym}
              trigger={
                <button className="w-full flex items-center px-2 py-1.5 text-sm">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </button>
              }
            />
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el gimnasio
              &ldquo;{gym.name}&rdquo; y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
