import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_URL } from "../constants/config";

export async function login(data) {
  const res = await axios.post(`${API_URL}/auth/login`, data);
  const token = res.data?.token;
  if (!token) throw new Error("Hiányzó token a válaszban");
  await SecureStore.setItemAsync("token", token);
  return res.data;
}

export async function register(data) {
  const res = await axios.post(`${API_URL}/auth/register`, data);
  const token = res.data?.token;
  if (token) await SecureStore.setItemAsync("token", token);
  return res.data;
}

export async function logout() {
  await SecureStore.deleteItemAsync("token");
}

export async function getToken() {
  return SecureStore.getItemAsync("token");
}
