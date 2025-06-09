'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface QRGeneratorProps {
  // You can add props here if needed, e.g., userId
}

const QRGenerator: React.FC<QRGeneratorProps> = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/access-control/my-qr'); // Adjust endpoint if necessary
        if (!response.ok) {
          throw new Error(`Error fetching QR code: ${response.statusText}`);
        }
        const data = await response.json();
        // Assuming the backend returns the QR code data URL in a 'qrCodeUrl' field
        if (data.qrCodeUrl) {
          setQrCodeUrl(data.qrCodeUrl);
        } else {
          setError('QR code data not found in response.');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQRCode();
  }, []); // Empty dependency array means this effect runs once on mount

  if (loading) {
    return <div>Loading QR code...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!qrCodeUrl) {
    return <div>No QR code available.</div>;
  }

  return (
    <div>
      <h2>Your Access QR Code</h2>
      <Image src={qrCodeUrl} alt="Your gym access QR code" width={200} height={200} />
    </div>
  );
};

export default QRGenerator;