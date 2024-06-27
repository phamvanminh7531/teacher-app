// hooks/useCameraPermissions.js
import { useState, useEffect } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';

export const useCameraPermissions = () => {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getPermissions();
  }, []);

  return hasPermission;
};
