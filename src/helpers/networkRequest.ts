import axios, { AxiosInstance } from 'axios'

export const createLyricsAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    timeout: 15000,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 13)',
      'Content-Type': 'application/json'
    },
    httpAgent: {
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: 15000,
    },
    httpsAgent: {
      keepAlive: true,
      keepAliveMsecs: 1000,
      maxSockets: 50,
      maxFreeSockets: 10,
      timeout: 15000,
      rejectUnauthorized: false
    },
    validateStatus: () => true
  })

  instance.interceptors.response.use(
    response => response,
    async (error) => {
      const config = error.config;
      
      if (!config) return Promise.reject(error);
      
      if (!config.retryCount) config.retryCount = 0;
      if (config.retryCount >= 3) return Promise.reject(error);
      
      if (error.code !== 'ERR_NETWORK') return Promise.reject(error);
      
      config.retryCount++;
      const delay = config.retryCount * 1500;
      
      console.warn(`[RGMUSIC] Reintentando solicitud (intento ${config.retryCount}/3) en ${delay}ms...`)
      await new Promise(resolve => setTimeout(resolve, delay));
      return instance(config);
    }
  )

  return instance
}

export const logNetworkError = (error: any) => {
  console.error('[RGMUSIC] Full error:', {
    message: error?.message,
    code: error?.code,
    errno: error?.errno,
    response: {
      status: error?.response?.status,
      data: error?.response?.data
    },
    request: error?.request ? 'made' : 'not made',
    config: {
      url: error?.config?.url,
      method: error?.config?.method,
      retryCount: error?.config?.retryCount
    }
  })
  
  if (error?.code === 'ERR_NETWORK') {
    console.warn('[RGMUSIC] Problema de red detectado')
    console.warn('[RGMUSIC] Posibles causas: proxy, firewall, DNS, o problemas de SSL')
    console.warn('[RGMUSIC] Intenta: 1) Cambiar de red WiFi 2) Usar datos móviles 3) Reiniciar el dispositivo')
  }
}
