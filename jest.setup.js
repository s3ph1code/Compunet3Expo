/**
 * Configuración global de los tests.
 *
 * AsyncStorage es un módulo nativo: fuera de un dispositivo no existe. Aquí lo
 * reemplazamos por el mock en memoria que trae la propia librería, para que
 * cualquier test pueda importar la capa de datos sin montar la app.
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
