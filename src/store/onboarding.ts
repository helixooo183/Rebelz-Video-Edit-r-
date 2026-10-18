import { readJSON, removeKey, STORAGE_KEYS, writeJSON } from './storage';

export async function hasOnboarded(): Promise<boolean> {
  try {
    return (await readJSON<boolean>(STORAGE_KEYS.onboarded)) === true;
  } catch {
    return false;
  }
}

export async function markOnboarded(): Promise<void> {
  await writeJSON(STORAGE_KEYS.onboarded, true);
}

export async function resetOnboarding(): Promise<void> {
  await removeKey(STORAGE_KEYS.onboarded);
}
