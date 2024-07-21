import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { API_BASE_URL } from '../config';

export default function HomeScreen({ navigation }) {
  const [token, setToken] = useState('');
  const [certId, setCertId] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scannerVisible, setScannerVisible] = useState(false);

  useEffect(() => {
    const getTokenAndPrivateKey = async () => {
      const accessToken = await AsyncStorage.getItem('access_token');
      const storedPrivateKey = await AsyncStorage.getItem('private_key');
      setToken(accessToken);
      setPrivateKey(storedPrivateKey);
    };
    getTokenAndPrivateKey();

    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('access_token');
    navigation.replace('Login');
  };

  const deletePrivateKey = async () => {
    await AsyncStorage.removeItem('private_key');
  };

  const getTeacherPrivateKey = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get-private-key/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        const privateKey = response.data;
        setPrivateKey(privateKey);
        await AsyncStorage.setItem('private_key', privateKey);
       // Optionally delete the private key from the serve
        await axios.delete(`${API_BASE_URL}/delete-private-key/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        console.error('Failed to fetch private key:', response.statusText);
        Alert.alert('Error', 'Failed to fetch private key. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch data from API.');
      console.error(error);
    }
  };

  const signCert = async () => {
    if (hasPermission) {
      setScannerVisible(true);
    } else {
      Alert.alert('Error', 'No access to camera');
    }
  };

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setCertId(data);
    Alert.alert('Scanned!', `Cert ID: ${data}`);
    setScannerVisible(false);

    // Call the API to sign the certificate
    signCertificate(data);
  };

  const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // Increase timeout to 60 seconds
  });

  const signCertificate = async (certId) => {
    try {
      const response = await axiosInstance.post(`${API_BASE_URL}/sign-cert/${certId}`, 
      { 
        privateKey: privateKey 
      }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200) {
        Alert.alert('Success', 'Ký chứng chỉ thành công');
      } else {
        console.error('Failed to sign certificate:', response.statusText);
        Alert.alert('Error', 'Ký duyệt không thành công. Xin vui lòng thử lại.');
      }
    } catch (error) {
      Alert.alert('Error', 'Lỗi');
      console.error(error);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <View style={styles.container}>
      {scannerVisible ? (
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
          {scanned && <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />}
          <TouchableOpacity style={styles.exitButton} onPress={() => setScannerVisible(false)}>
            <Text style={styles.exitButtonText}>Exit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <Text style={styles.content}>Cert ID: {certId}</Text>
          <Button
            title="Tải mã khóa về điện thoại"
            onPress={getTeacherPrivateKey}
            disabled={!!privateKey}
          />
          <Button title="Ký duyệt chứng chỉ" onPress={signCert} />
          <Button title="Delete" onPress={deletePrivateKey} />
          <Button title="Đăng xuất" onPress={handleLogout} />
          <Text style={styles.content}>{privateKey}</Text>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  content: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'left',
    color: 'green',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitButton: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  exitButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
