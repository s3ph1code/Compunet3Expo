import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEY } from './constants';

/**
 * Lee el array completo de transacciones desde AsyncStorage.
 * Nunca lanza: si no hay nada guardado o el JSON está corrupto, devuelve [].
 * @returns {Promise<Array>} array de transacciones (puede venir vacío)
 */
export async function loadTransactions() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    // Si alguien guardó algo que no es un array, lo ignoramos en vez de tumbar la app.
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('[storage] No se pudieron leer las transacciones:', error);
    return [];
  }
}

/**
 * Guarda el array completo de transacciones, reemplazando lo que hubiera.
 * @param {Array} transactions array completo ya actualizado
 * @returns {Promise<void>}
 * @throws {Error} si no recibe un array o si la escritura falla
 */
export async function saveTransactions(transactions) {
  if (!Array.isArray(transactions)) {
    throw new Error('saveTransactions espera un array de transacciones.');
  }
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

/**
 * Borra por completo la clave de transacciones.
 * Pensado para desarrollo y tests, no para uso normal de la app.
 * @returns {Promise<void>}
 */
export async function clearStorage() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
