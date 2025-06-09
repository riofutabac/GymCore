"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  Users, 
  Search, 
  Filter,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  CreditCard,
  Loader2
} from "lucide-react";
import { membershipApi } from "@/lib/api";

interface Member {
  id: string;
  type: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'PENDING_PAYMENT';
  startDate: string;
  expiresAt: string;
  monthlyPrice: number;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  payments: Array<{
    id: string;
    amount: number;
    createdAt: string;
  }>;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await membershipApi.getAllMemberships();
      setMembers(response.data || []);
    } catch (error: any) {
      console.error('Error loading members:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron cargar los socios",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || member.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'EXPIRED': return 'bg-red-500';
      case 'SUSPENDED': return 'bg-yellow-500';
      case 'PENDING_PAYMENT': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activo';
      case 'EXPIRED': return 'Expirado';
      case 'SUSPENDED': return 'Suspendido';
      case 'PENDING_PAYMENT': return 'Pago Pendiente';
      default: return status;
    }
  };

  const handleRenewMembership = async (memberId: string) => {
    try {
      await membershipApi.renew(memberId, {
        paymentMethod: 'CASH',
        amount: 50.00,
        description: 'Renovación de membresía'
      });
      
      toast({
        title: "Membresía renovada",
        description: "La membresía se ha renovado correctamente",
      });
      
      await loadMembers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al renovar la membresía",
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Socios</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Socios</h1>
          <p className="text-muted-foreground">
            Administra las membresías y estado de los socios
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Socios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
            <p className="text-xs text-muted-foreground">
              Registrados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Socios Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {members.filter(m => m.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Con membresía vigente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membresías Expiradas</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {members.filter(m => m.status === 'EXPIRED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requieren renovación
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspendidos</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {members.filter(m => m.status === 'SUSPENDED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Membresías suspendidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar socios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activos</SelectItem>
                <SelectItem value="EXPIRED">Expirados</SelectItem>
                <SelectItem value="SUSPENDED">Suspendidos</SelectItem>
                <SelectItem value="PENDING_PAYMENT">Pago Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{member.user.name || 'Sin nombre'}</CardTitle>
                  <CardDescription>{member.user.email}</CardDescription>
                </div>
                <Badge className={getStatusColor(member.status)}>
                  {getStatusText(member.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {member.user.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.user.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Membresía {member.type} - ${member.monthlyPrice}/mes</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Vence: {new Date(member.expiresAt).toLocaleDateString()}</span>
              </div>
              
              {member.payments.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Último pago: ${member.payments[0].amount} - {new Date(member.payments[0].createdAt).toLocaleDateString()}
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Perfil
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleRenewMembership(member.id)}
                  disabled={member.status === 'ACTIVE'}
                >
                  Renovar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-32">
            <Users className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {members.length === 0 
                ? "No hay socios registrados en el gimnasio"
                : "No se encontraron socios con los filtros aplicados"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}