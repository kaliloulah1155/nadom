import { useApi } from '~/composables/useApi'
import { ref } from 'vue'

export const useUpload = () => {
  const uploading = ref(false)
  const error = ref<string | null>(null)

  const uploadImage = async (file: File, folder: string = 'uploads'): Promise<string | null> => {
    error.value = null
    uploading.value = true

    try {
      const api = useApi()
      const formData = new FormData()
      formData.append('image', file)
      formData.append('folder', folder)

      const res = await api.post<{ url: string }>('/upload/image', formData)
      if (res.success && res.data?.url) {
        return res.data.url
      }
      error.value = res.message
      return null
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de l\'upload'
      return null
    } finally {
      uploading.value = false
    }
  }

  const uploadFile = async (file: File, folder: string = 'files'): Promise<{ url: string; filename: string } | null> => {
    error.value = null
    uploading.value = true

    try {
      const api = useApi()
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const res = await api.post<{ url: string; filename: string }>('/upload/file', formData)
      if (res.success && res.data?.url) {
        return res.data
      }
      error.value = res.message
      return null
    } catch (err: any) {
      error.value = err.message || 'Erreur lors de l\'upload'
      return null
    } finally {
      uploading.value = false
    }
  }

  return {
    uploading,
    error,
    uploadImage,
    uploadFile
  }
}