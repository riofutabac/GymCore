'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, Member } from '@/lib/types';
import { useGymStore } from '@/lib/store';
import api from '@/lib/api';
import { Search, ShoppingCart, Trash2, Plus, Minus, User } from 'lucide-react';

interface CartItem {
  product: Product;
  quantity: number;
}

export function PointOfSale() {
  const { currentGym } = useGymStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cargar productos y miembros al iniciar
  useEffect(() => {
    if (currentGym?.id) {
      loadProducts();
      loadMembers();
    }
  }, [currentGym]);

  // Filtrar productos según término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  // Cargar productos del gimnasio actual
  const loadProducts = async () => {
    if (!currentGym?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      const productsData = await api.inventory.getProducts(currentGym.id);
      // Filtrar solo productos activos con stock
      const activeProducts = productsData.filter(p => p.isActive && p.stock > 0);
      setProducts(activeProducts);
      setFilteredProducts(activeProducts);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setError('No se pudieron cargar los productos');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar miembros del gimnasio actual
  const loadMembers = async () => {
    if (!currentGym?.id) return;

    try {
      const membersData = await api.members.getMembers(currentGym.id);
      // Filtrar solo miembros activos
      const activeMembers = membersData.filter(m => m.isActive);
      setMembers(activeMembers);
    } catch (err) {
      console.error('Error al cargar miembros:', err);
    }
  };

  // Agregar producto al carrito
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Si el producto ya está en el carrito, aumentar cantidad
        return prevCart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } 
            : item
        );
      } else {
        // Si no está en el carrito, agregarlo con cantidad 1
        return [...prevCart, { product, quantity: 1 }];
      }
    });
  };

  // Actualizar cantidad de un producto en el carrito
  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    // Asegurar que la cantidad no exceda el stock disponible
    const safeQuantity = Math.max(1, Math.min(newQuantity, product.stock));
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: safeQuantity } 
          : item
      )
    );
  };

  // Eliminar producto del carrito
  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  // Calcular total del carrito
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  // Procesar la venta
  const processSale = async () => {
    if (cart.length === 0) {
      setError('El carrito está vacío');
      return;
    }

    if (!currentGym?.id) {
      setError('No hay un gimnasio seleccionado');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Preparar datos de la venta
      const saleData = {
        gymId: currentGym.id,
        memberId: selectedMemberId || undefined,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        }))
      };
      
      // Registrar la venta
      await api.sales.recordSale(saleData);
      
      // Limpiar carrito y mostrar mensaje de éxito
      setCart([]);
      setSelectedMemberId(null);
      setSuccessMessage('Venta registrada correctamente');
      
      // Recargar productos para actualizar stock
      loadProducts();
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Error al procesar la venta:', err);
      setError('No se pudo procesar la venta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Lista de productos */}
      <div className="md:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Productos</CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar productos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">Cargando productos...</div>
            ) : error ? (
              <div className="text-red-500 py-4">{error}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron productos
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredProducts.map(product => (
                  <Card key={product.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">{product.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description || 'Sin descripción'}
                          </p>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="font-medium">${product.price.toFixed(2)}</span>
                            <span className="text-sm text-muted-foreground">
                              Stock: {product.stock}
                            </span>
                          </div>
                        </div>
                        <Button 
                          size="icon" 
                          onClick={() => addToCart(product)}
                          disabled={product.stock <= 0}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Carrito de compras */}
      <div>
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrito
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selección de miembro (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="member">Miembro (opcional)</Label>
              <Select
                value={selectedMemberId || ''}
                onValueChange={(value) => setSelectedMemberId(value || null)}
              >
                <SelectTrigger id="member">
                  <SelectValue placeholder="Seleccionar miembro" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin miembro</SelectItem>
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lista de productos en el carrito */}
            <div className="space-y-2">
              {cart.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  El carrito está vacío
                </div>
              ) : (
                <div className="space-y-2">
                  {cart.map(item => (
                    <div key={item.product.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex-1">
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${item.product.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="icon" 
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button 
                          size="icon" 
                          variant="outline"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => removeFromCart(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total y botón de completar venta */}
            <div className="pt-4 border-t">
              <div className="flex justify-between mb-4">
                <span className="font-medium">Total:</span>
                <span className="font-bold">${calculateTotal().toFixed(2)}</span>
              </div>
              
              {successMessage && (
                <div className="bg-green-100 text-green-800 p-2 rounded mb-4 text-center">
                  {successMessage}
                </div>
              )}
              
              {error && (
                <div className="bg-red-100 text-red-800 p-2 rounded mb-4 text-center">
                  {error}
                </div>
              )}
              
              <Button 
                className="w-full" 
                onClick={processSale}
                disabled={isLoading || cart.length === 0}
              >
                {isLoading ? 'Procesando...' : 'Completar Venta'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
