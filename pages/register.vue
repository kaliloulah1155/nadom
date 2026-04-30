<template>
    <div class="bg-cover" :style="{backgroundImage:`url(${bg})`, backgroundColor:'#ffe8ede', backgroundRepeat:'no-repeat'}">
        <div id="main-wrapper">
            <section>
                <div class="container">
                    <div class="row align-items-center justify-content-center">
                        <div class="col-xl-5 col-lg-7 col-md-9">
                            <div class="authWrap">
                                <div class="authhead">
                                    <div class="text-center mb-4">
                                        <NuxtLink to="/">
                                            <img class="img-fluid" :src="logo" width="55" alt="logo"/>
                                        </NuxtLink>
                                    </div>
                                </div>

                                <div class="authbody d-black mb-4">
                                    <div class="card rounded-4 p-sm-5 p-4">
                                        <div class="card-body p-0">
                                            <div class="text-center">
                                                <h1 class="mb-2 fs-2">Create An Account!</h1>
                                            </div>
                                            
                                            <div v-if="error" class="alert alert-danger">{{ error }}</div>
                                            
                                            <form class="mt-5 text-start" @submit.prevent="onSubmit">
                                                <div class="form mb-5">
                                                    <div class="row">
                                                        <div class="col-md-6 mb-3">
                                                            <div class="form-group form-border">
                                                                <label class="form-label">Firstname *</label>
                                                                <input v-model="form.firstname" type="text" class="form-control" placeholder="John" required />
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6 mb-3">
                                                            <div class="form-group form-border">
                                                                <label class="form-label">Lastname *</label>
                                                                <input v-model="form.lastname" type="text" class="form-control" placeholder="Doe" required />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="form-group form-border mb-3">
                                                        <label class="form-label">Email *</label>
                                                        <input v-model="form.email" type="email" class="form-control" placeholder="name@example.com" required />
                                                    </div>
                                                    
                                                    <div class="form-group form-border mb-3">
                                                        <label class="form-label">Phone</label>
                                                        <input v-model="form.phone" type="tel" class="form-control" placeholder="+2250714158172" />
                                                    </div>

                                                    <div class="row">
                                                        <div class="col-md-6 mb-3">
                                                            <div class="form-group form-border">
                                                                <label class="form-label">Country</label>
                                                                <input v-model="form.country" type="text" class="form-control" placeholder="Côte d'Ivoire" />
                                                            </div>
                                                        </div>
                                                        <div class="col-md-6 mb-3">
                                                            <div class="form-group form-border">
                                                                <label class="form-label">City</label>
                                                                <input v-model="form.city" type="text" class="form-control" placeholder="Abidjan" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="form-group form-border mb-3">
                                                        <label class="form-label">Password *</label>
                                                        <div class="position-relative">
                                                            <input v-model="form.password" type="password" class="form-control" id="password-field" placeholder="Min. 8 characters" required minlength="8" />
                                                        </div>
                                                    </div>
                                                    
                                                    <div class="form-group form-border mb-3">
                                                        <label class="form-label">Confirm Password *</label>
                                                        <input v-model="form.password_confirmation" type="password" class="form-control" placeholder="*********" required minlength="8" />
                                                    </div>

                                                    <p v-if="form.password !== form.password_confirmation && form.password_confirmation" class="text-danger small">
                                                        Passwords do not match
                                                    </p>

                                                    <div class="form-group mb-4">
                                                        <button type="submit" class="btn btn-primary full-width fw-medium" :disabled="loading || form.password !== form.password_confirmation">
                                                            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                                            {{ loading ? 'Creating...' : 'Create Account' }}
                                                        </button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                <div class="authfooter">
                                    <div class="text-center">
                                        <p class="text-dark mb-0">
                                            Already have an account?
                                            <NuxtLink to="/login" class="fw-medium text-primary"> Login Here</NuxtLink>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const bg = '/assets/img/auth-bg.png'
const logo = '/assets/img/icon.png'

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)
const error = ref('')

const form = reactive({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    password: '',
    password_confirmation: ''
})

const onSubmit = async () => {
    error.value = ''
    
    if (form.password !== form.password_confirmation) {
        error.value = 'Passwords do not match'
        return
    }
    
    if (form.password.length < 8) {
        error.value = 'Password must be at least 8 characters'
        return
    }
    
    loading.value = true
    
    try {
        await authStore.register({
            firstname: form.firstname,
            lastname: form.lastname,
            email: form.email,
            password: form.password,
            phone: form.phone || undefined,
            country: form.country || undefined,
            city: form.city || undefined
        })
        
        // Redirect to login or show success
        router.push('/login?registered=true')
    } catch (err: any) {
        error.value = err.message || 'Failed to create account'
    } finally {
        loading.value = false
    }
}
</script>

<style lang="scss" scoped>
.form-border {
    .form-label {
        font-weight: 500;
        font-size: 0.9rem;
    }
}
</style>