import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  preferences: 'rebelcut.preferences.v1',
  projects: 'rebelcut.projects.v1',
  onboarded: 'rebelcut.onboarded.v1',
} as const;

export async function readJSON<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[storage] okunamadı: ${key}`, error);
    throw error;
  }
}

export async function writeJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`[storage] yazılamadı: ${key}`, error);
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.warn(`[storage] silinemedi: ${key}`, error);
  }
}

export async function clearAllAppData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
}
