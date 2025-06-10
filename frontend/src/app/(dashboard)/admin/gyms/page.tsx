import { Suspense } from 'react';
import { gymsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Users, Calendar, MoreVertical, Plus } from 'lucide-react';
import { CreateGymDialog } from '@/components/features/gyms/CreateGymDialog';
import { GymActions } from '@/components/features/gyms/GymActions';

export default async function GymsManagementPage() {
  const gyms = await gymsAPI.getAll();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Gimnasios</h1>
          <p className="text-muted-foreground">
            Administra todos los gimnasios registrados en la plataforma
          </p>
        </div>
        <CreateGymDialog />
      </div>

      {gyms.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay gimnasios registrados</h3>
            <p className="text-muted-foreground mb-4">
              Comienza creando el primer gimnasio en la plataforma
            </p>
            <CreateGymDialog>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Crear Primer Gimnasio
              </Button>
            </CreateGymDialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gyms.map((gym) => (
            <Card key={gym.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{gym.name}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Building2 className="mr-1 h-3 w-3" />
                    {gym.address}
                  </CardDescription>
                </div>
                <GymActions gym={gym} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Código de acceso:</span>
                  <Badge variant="secondary" className="font-mono">
                    {gym.joinCode}
                  </Badge>
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-3 w-3" />
                  Creado: {new Date(gym.createdAt).toLocaleDateString()}
                </div>

                <Suspense fallback={<div className="h-4 bg-gray-200 rounded animate-pulse" />}>
                  <GymMemberCount gymId={gym.id} />
                </Suspense>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

async function GymMemberCount({ gymId }: { gymId: string }) {
  try {
    const { total } = await membersAPI.getAll(gymId, 1, 1);
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Users className="mr-1 h-3 w-3" />
        {total} miembros activos
      </div>
    );
  } catch {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <Users className="mr-1 h-3 w-3" />
        -- miembros
      </div>
    );
  }
}