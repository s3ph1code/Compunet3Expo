/**
 * Configuración global de los tests.
 *
 * Va en "setupFilesAfterEnv" y no en "setupFiles" a propósito: el preset de
 * jest-expo ya define sus propios "setupFiles" (el setup de React Native y el
 * de Expo), y declararlos en package.json los reemplazaría en vez de sumarse.
 *
 * AsyncStorage es un módulo nativo: fuera de un dispositivo no existe. Aquí lo
 * cambiamos por el mock en memoria que trae la propia librería, para que
 * cualquier test pueda importar la capa de datos sin montar la app.
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
