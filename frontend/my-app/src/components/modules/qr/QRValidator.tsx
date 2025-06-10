'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Member } from '@/lib/types';
import api from '@/lib/api';
import { useGymStore } from '@/lib/store';
import { CheckCircle, XCircle, AlertCircle, Camera } from 'lucide-react';

export function QRValidator() {
  const { currentGym } = useGymStore();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    member?: Member;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Iniciar el escáner de QR
  const startScanner = async () => {
    setScanning(true);
    setResult(null);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Iniciar el intervalo para escanear frames
        scanIntervalRef.current = setInterval(() => {
          captureAndProcessFrame();
        }, 500);
      }
    } catch (err) {
      console.error('Error al acceder a la cámara:', err);
      setError('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
      setScanning(false);
    }
  };

  // Detener el escáner
  const stopScanner = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    setScanning(false);
  };

  // Capturar y procesar un frame del video
  const captureAndProcessFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !videoRef.current.videoWidth) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;

    // Ajustar el tamaño del canvas al video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dibujar el frame actual en el canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      // Aquí iría la lógica para decodificar el QR usando una librería como jsQR
      // Por simplicidad, simularemos la detección con un código aleatorio
      const qrCode = `member-${Math.floor(Math.random() * 1000)}`;
      
      // Validar el QR con el backend
      await validateQRCode(qrCode);
    } catch (err) {
      // Ignorar errores de decodificación, seguir escaneando
    }
  };

  // Validar el código QR con el backend
  const validateQRCode = async (qrCode: string) => {
    if (!currentGym?.id) {
      setError('No hay un gimnasio seleccionado');
      stopScanner();
      return;
    }

    try {
      setLoading(true);
      
      // Llamar a la API para validar el QR
      const validationResult = await api.access.validateQR(qrCode, currentGym.id);
      
      // Detener el escáner después de una validación exitosa
      stopScanner();
      
      setResult({
        success: validationResult.valid,
        message: validationResult.message,
        member: validationResult.member
      });
    } catch (err) {
      console.error('Error al validar QR:', err);
      setError('Error al validar el código QR. Intenta nuevamente.');
      stopScanner();
    } finally {
      setLoading(false);
    }
  };

  // Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
      }
      
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Validador de Acceso QR</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>{result.success ? 'Acceso Permitido' : 'Acceso Denegado'}</AlertTitle>
            <AlertDescription>
              {result.message}
              {result.member && (
                <div className="mt-2">
                  <p><strong>Socio:</strong> {result.member.name}</p>
                  <p><strong>Email:</strong> {result.member.email}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="relative">
          {scanning && (
            <div className="relative aspect-video max-h-[400px] overflow-hidden rounded-lg border">
              <video 
                ref={videoRef} 
                className="h-full w-full object-cover"
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-48 w-48 border-2 border-primary opacity-70"></div>
              </div>
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        
        <div className="flex justify-center">
          {!scanning ? (
            <Button 
              onClick={startScanner} 
              disabled={loading}
              className="gap-2"
            >
              <Camera className="h-4 w-4" />
              Escanear QR
            </Button>
          ) : (
            <Button 
              onClick={stopScanner} 
              variant="outline"
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
