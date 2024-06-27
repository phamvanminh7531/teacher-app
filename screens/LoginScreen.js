import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config'; // Import the base URL

export default function LoginScreen({ navigation }) {
  const [user_code, setUser_code] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${ API_BASE_URL }/token/`, {
        user_code,
        password,
      });
      await AsyncStorage.setItem('access_token', response.data.access);
      navigation.replace('Home');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>ỨNG DỤNG QUẢN LÝ MÃ KHÓA CỦA GIẢNG VIÊN</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập mã giảng viên"
        value={user_code}
        onChangeText={setUser_code}
      />
      <TextInput
        style={styles.input}
        placeholder="Nhập mật khẩu"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Đăng nhập" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    paddingLeft: 8,
  },
});
