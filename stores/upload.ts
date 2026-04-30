import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'

export const useUploadStore = defineStore('upload', {
  actions: {
    async uploadImage(file: File, folder: string = 'uploads'): Promise<string | null> {
      const api = useApi()
      const formData = new FormData()
      formData.append('image', file)
      formData.append('folder', folder)

      try {
        const res = await api.post<{ url: string }>('/upload/image', formData)
        if (res.success && res.data?.url) {
          return res.data.url
        }
        throw new Error(res.message)
      } catch (err: any) {
        console.error('Upload error:', err)
        throw err
      }
    },

    async uploadFile(file: File, folder: string = 'files'): Promise<{ url: string; filename: string; size: number } | null> {
      const api = useApi()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      try {
        const res = await api.post<{ url: string; filename: string; size: number }>('/upload/file', formData)
        if (res.success && res.data?.url) {
          return res.data
        }
        throw new Error(res.message)
      } catch (err: any) {
        console.error('Upload error:', err)
        throw err
      }
    }
  }
})