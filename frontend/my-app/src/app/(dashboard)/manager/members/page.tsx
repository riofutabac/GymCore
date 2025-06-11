'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGymStore } from '@/lib/store';
import { UserPlus, Users, UserCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MemberFormData {
  name: string;
  email: string;
  phone: string;
  membershipType: string;
  startDate: string;
  endDate: string;
}

export default function MembersPage() {
  const { currentGym } = useGymStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<MemberFormData>({
    name: '',
    email: '',
    phone: '',
    membershipType: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
  });

  // Consulta para obtener los miembros del gimnasio actual
  const { data: members, isLoading, error, refetch } = useQuery({
    queryKey: ['members', currentGym?.id],
    queryFn: () => currentGym?.id ? api.members.getMembers(currentGym.id) : Promise.resolve([]),
    enabled: !!currentGym?.id,
  });

  // Consulta para obtener los tipos de membresía disponibles
  const { data: membershipTypes } = useQuery({
    queryKey: ['membershipTypes', currentGym?.id],
    queryFn: () => currentGym?.id ? api.members.getMembershipTypes(currentGym.id) : Promise.resolve([]),
    enabled: !!currentGym?.id,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Ajustar fecha de fin según el tipo de membresía seleccionado
    if (name === 'membershipType') {
      const startDate = new Date(formData.startDate);
      let endDate = new Date(startDate);
      
      switch (value) {
        case 'daily':
          endDate.setDate(startDate.getDate() + 1);
          break;
        case 'weekly':
          endDate.setDate(startDate.getDate() + 7);
          break;
        case 'monthly':
          endDate.setMonth(startDate.getMonth() + 1);
          break;
        case 'quarterly':
          endDate.setMonth(startDate.getMonth() + 3);
          break;
        case 'semiannual':
          endDate.setMonth(startDate.getMonth() + 6);
          break;
        case 'annual':
          endDate.setFullYear(startDate.getFullYear() + 1);
          break;
        default:
          endDate.setMonth(startDate.getMonth() + 1);
      }
      
      setFormData(prev => ({
        ...prev,
        endDate: endDate.toISOString().split('T')[0]
      }));
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDate = new Date(e.target.value);
    let endDate = new Date(startDate);
    
    // Ajustar fecha de fin según el tipo de membresía seleccionado
    switch (formData.membershipType) {
      case 'daily':
        endDate.setDate(startDate.getDate() + 1);
        break;
      case 'weekly':
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(startDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(startDate.getMonth() + 3);
        break;
      case 'semiannual':
        endDate.setMonth(startDate.getMonth() + 6);
        break;
      case 'annual':
        endDate.setFullYear(startDate.getFullYear() + 1);
        break;
      default:
        endDate.setMonth(startDate.getMonth() + 1);
    }
    
    setFormData(prev => ({
      ...prev,
      startDate: e.target.value,
      endDate: endDate.toISOString().split('T')[0]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentGym?.id) return;
    
    try {
      await api.members.create({
        ...formData,
        gymId: currentGym.id
      });
      
      // Limpiar formulario y refrescar lista
      setFormData({
        name: '',
        email: '',
        phone: '',
        membershipType: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      });
      refetch();
    } catch (error) {
      console.error('Error al crear miembro:', error);
    }
  };

  const filteredMembers = members?.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Miembros</h1>
        <p className="text-muted-foreground">
          {currentGym ? `Gimnasio: ${currentGym.name}` : 'Seleccione un gimnasio'}
        </p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Miembros
          </TabsTrigger>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Nuevo Miembro
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Miembros</CardTitle>
              <CardDescription>Gestiona los miembros de tu gimnasio</CardDescription>
              <div className="mt-2">
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Cargando miembros...</div>
              ) : error ? (
                <div className="text-center py-4 text-red-500">Error al cargar miembros</div>
              ) : filteredMembers?.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  {searchTerm ? 'No se encontraron miembros con ese criterio' : 'No hay miembros registrados'}
                </div>
              ) : (
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left font-medium">Nombre</th>
                        <th className="p-2 text-left font-medium">Email</th>
                        <th className="p-2 text-left font-medium">Membresía</th>
                        <th className="p-2 text-left font-medium">Estado</th>
                        <th className="p-2 text-left font-medium">Vencimiento</th>
                        <th className="p-2 text-left font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers?.map((member) => (
                        <tr key={member.id} className="border-b hover:bg-muted/50">
                          <td className="p-2">{member.name}</td>
                          <td className="p-2">{member.email}</td>
                          <td className="p-2">{member.membershipType}</td>
                          <td className="p-2">
                            <span className={`rounded-full px-2 py-1 text-xs ${member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {member.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="p-2">{new Date(member.endDate).toLocaleDateString()}</td>
                          <td className="p-2">
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">Editar</Button>
                              <Button variant="outline" size="sm" className="text-green-600">
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="new" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Nuevo Miembro</CardTitle>
              <CardDescription>Registra un nuevo miembro en el gimnasio</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="membershipType">Tipo de membresía</Label>
                    <Select 
                      value={formData.membershipType} 
                      onValueChange={(value) => handleSelectChange('membershipType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {membershipTypes ? (
                          membershipTypes.map(type => (
                            <SelectItem key={type.id} value={type.code}>
                              {type.name}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="daily">Diaria</SelectItem>
                            <SelectItem value="weekly">Semanal</SelectItem>
                            <SelectItem value="monthly">Mensual</SelectItem>
                            <SelectItem value="quarterly">Trimestral</SelectItem>
                            <SelectItem value="semiannual">Semestral</SelectItem>
                            <SelectItem value="annual">Anual</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de inicio</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={handleStartDateChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Fecha de vencimiento</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      disabled
                    />
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <Button type="submit">Registrar Miembro</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}