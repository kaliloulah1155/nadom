import { ref, reactive } from 'vue'

type ValidationRule = (value: any) => string | true
type ValidationRules = Record<string, ValidationRule[]>

export const useForm = <T extends Record<string, any>>(initialData: T) => {
  const form = reactive<T>({ ...initialData })
  const errors = ref<Record<string, string>>({})
  const loading = ref(false)
  const touched = ref<Record<string, boolean>>({})

  // Règles de validation prédéfinies
  const rules = {
    required: (message = 'Ce champ est requis'): ValidationRule => {
      return (value: any) => {
        if (value === null || value === undefined || value === '') {
          return message
        }
        if (Array.isArray(value) && value.length === 0) {
          return message
        }
        return true
      }
    },

    email: (message = 'Email invalide'): ValidationRule => {
      return (value: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return !value || emailRegex.test(value) ? true : message
      }
    },

    minLength: (min: number, message?: string): ValidationRule => {
      return (value: string) => {
        const msg = message || `Minimum ${min} caractères`
        return !value || value.length >= min ? true : msg
      }
    },

    maxLength: (max: number, message?: string): ValidationRule => {
      return (value: string) => {
        const msg = message || `Maximum ${max} caractères`
        return !value || value.length <= max ? true : msg
      }
    },

    min: (min: number, message?: string): ValidationRule => {
      return (value: number) => {
        const msg = message || `Valeur minimum: ${min}`
        return value === undefined || value >= min ? true : msg
      }
    },

    max: (max: number, message?: string): ValidationRule => {
      return (value: number) => {
        const msg = message || `Valeur maximum: ${max}`
        return value === undefined || value <= max ? true : msg
      }
    },

    phone: (message = 'Numéro de téléphone invalide'): ValidationRule => {
      return (value: string) => {
        const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
        return !value || phoneRegex.test(value.replace(/\s/g, '')) ? true : message
      }
    },

    match: (fieldName: string, message?: string): ValidationRule => {
      return (value: any) => {
        const msg = message || `Les champs ne correspondent pas`
        return value === (form as any)[fieldName] ? true : msg
      }
    },

    pattern: (regex: RegExp, message = 'Format invalide'): ValidationRule => {
      return (value: string) => {
        return !value || regex.test(value) ? true : message
      }
    }
  }

  const validate = (validationRules: ValidationRules): boolean => {
    errors.value = {}

    for (const field in validationRules) {
      const fieldRules = validationRules[field]
      const value = (form as any)[field]

      for (const rule of fieldRules) {
        const result = rule(value)
        if (result !== true) {
          errors.value[field] = result
          break
        }
      }
    }

    return Object.keys(errors.value).length === 0
  }

  const validateField = (field: string, fieldRules: ValidationRule[]): boolean => {
    const value = (form as any)[field]
    delete errors.value[field]

    for (const rule of fieldRules) {
      const result = rule(value)
      if (result !== true) {
        errors.value[field] = result
        return false
      }
    }

    return true
  }

  const setError = (field: string, message: string) => {
    errors.value[field] = message
  }

  const clearErrors = () => {
    errors.value = {}
  }

  const clearError = (field: string) => {
    delete errors.value[field]
  }

  const reset = () => {
    Object.assign(form, initialData)
    errors.value = {}
    touched.value = {}
  }

  const setTouched = (field: string) => {
    touched.value[field] = true
  }

  const isTouched = (field: string) => {
    return touched.value[field] || false
  }

  const hasError = (field: string) => {
    return !!errors.value[field]
  }

  const getError = (field: string) => {
    return errors.value[field] || ''
  }

  const setValues = (values: Partial<T>) => {
    Object.assign(form, values)
  }

  return {
    form,
    errors,
    loading,
    touched,
    rules,
    validate,
    validateField,
    setError,
    clearErrors,
    clearError,
    reset,
    setTouched,
    isTouched,
    hasError,
    getError,
    setValues
  }
}
