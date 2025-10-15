import { readFile, writeFile, CachesDirectoryPath, mkdir, readDir, unlink } from 'react-native-fs'

const generateSessionId = () => `${Date.now()}_${Math.random().toString(36).slice(2)}`

export const createTempSessionDir = async () => {
  const sessionId = generateSessionId();
  const tempDir = `${CachesDirectoryPath}/temp_${sessionId}`;
  await mkdir(tempDir);
  return tempDir;
}

export const deleteTempSessionDir = async (tempDir: string) => {
  const files = await readDir(tempDir);
  await Promise.all(files.map(file => unlink(file.path)));
  await unlink(tempDir)
}

export const getTemporaryFile = async (uri: string, fileName: string, tempDir: string): Promise<string> => {

  const safeName = fileName.replace(/[^a-z0-9_.-]/gi, '_')
  const destPath = `${tempDir}/${safeName}`

  const content = await readFile(uri, 'base64')
  
  
  await writeFile(destPath, content, 'base64')
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
  } catch (e) {
    return name
  }
}