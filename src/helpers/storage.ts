import { MMKVLoader } from 'react-native-mmkv-storage'

const storage = new MMKVLoader().initialize()

export const saveData = (key: string, value: any) => {
	storage.setString(key, JSON.stringify(value))
}

export const loadData = <T = any>(key: string): T | null => {
	try {
		const data = storage.getString(key)
		return data ? (JSON.parse(data) as T) : null
	} catch (error) {
		console.error(`Error loading ${key}`, error)
		return null
	}
}
