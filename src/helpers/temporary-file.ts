import * as FileSystem from 'expo-file-system/legacy'
import * as Crypto from 'expo-crypto'

const generateSessionId = () => Crypto.randomUUID()

export const createTempSessionDir = async () => {
  const sessionId = generateSessionId();
  const tempDirUri = `${FileSystem.cacheDirectory}temp_${sessionId}/`;
  await FileSystem.makeDirectoryAsync(tempDirUri, { intermediates: true });
  return tempDirUri.replace(/^file:\/\//, '').replace(/\/$/, '');
}

export const deleteTempSessionDir = async (tempDir: string) => {
  await FileSystem.deleteAsync(`file://${tempDir}`, { idempotent: true });
}

export const getTemporaryFile = async (uri: string, fileName: string, tempDir: string): Promise<string> => {

  const safeName = fileName.replace(/[^a-z0-9_.-]/gi, '_')
  const destPath = `${tempDir}/${safeName}`

  const content = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  })
  await FileSystem.writeAsStringAsync(`file://${destPath}`, content, {
    encoding: FileSystem.EncodingType.Base64,
  })
  return destPath
}

export const getTemporaryFileName = (uri : string) => {
  if (uri.startsWith('content://')) {
    const index = uri.lastIndexOf('%2F')
    let fileName = uri.substring(index + 3)
    try {
      fileName = decodeURIComponent(fileName)
    } catch (e) {
      console.warn('Error al decodificar el nombre del archivo:', e)
    }
    return fileName || 'Audio'
  }
  const name = uri.split('/').pop() || 'Audio'
  try {
    return decodeURIComponent(name)
  } catch {
    return name
  }
}
