"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  Search, 
  Filter,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  CreditCard
} from "lucide-react";

interface Member {
  id: string;
  name: string;
  email: string;
  phone?: string;
  membershipType: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  joinDate: string;
  expiresAt: string;
  lastAccess?: string;
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Datos simulados para demostración
  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    setLoading(true);
    
    // Simulamos datos de miembros
    const mockMembers: Member[] = [
      {
        id: "1",
        name: "Juan Pérez",
        email: "juan@example.com",
        phone: "+1 234 567 8901",
        membershipType: "Premium",
        status: "ACTIVE",
        joinDate: "2024-01-15",
        expiresAt: "2024-12-15",
        lastAccess: "2024-06-08"
      },
      {
        id: "2",
        name: "María García",
        email: "maria@example.com",
        phone: "+1 234 567 8902",
        membershipType: "Básica",
        status: "ACTIVE",
        joinDate: "2024-02-20",
        expiresAt: "2024-08-20",
        lastAccess: "2024-06-07"
      },
      {
        id: "3",
        name: "Carlos López",
        email: "carlos@example.com",
        membershipType: "Premium",
        status: "EXPIRED",
        joinDate: "2023-12-01",
        expiresAt: "2024-06-01",
        lastAccess: "2024-05-30"
      },
      {
        id: "4",
        name: "Ana Rodríguez",
        email: "ana@example.com",
        phone: "+1 234 567 8904",
        membershipType: "Básica",
        status: "SUSPENDED",
        joinDate: "2024-03-10",
        expiresAt: "2024-09-10",
        lastAccess: "2024-05-15"
      }
    ];
    
    setTimeout(() => {
      setMembers(mockMembers);
      setLoading(false);
    }, 1000);
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || member.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500';
      case 'EXPIRED': return 'bg-red-500';
      case 'SUSPENDED': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activo';
      case 'EXPIRED': return 'Expirado';
      case 'SUSPENDED': return 'Suspendido';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gestión de Socios</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
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
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription>{member.email}</CardDescription>
                </div>
                <Badge className={getStatusColor(member.status)}>
                  {getStatusText(member.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {member.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{member.phone}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>Membresía {member.membershipType}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Vence: {new Date(member.expiresAt).toLocaleDateString()}</span>
              </div>
              
              {member.lastAccess && (
                <div className="text-sm text-muted-foreground">
                  Último acceso: {new Date(member.lastAccess).toLocaleDateString()}
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Ver Perfil
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
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
              No se encontraron socios con los filtros aplicados
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}