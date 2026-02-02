<template>

    <div class="bg-cover" :style="{backgroundImage:`url(${bg})`, backgroundColor:'#ffe8ee', backgroundRepeat:'no-repeat', height:'100vh'}">
        <div id="main-wrapper">
            <section>
                <div class="container">
                    <div class="row align-items-center justify-content-center">
                        <div class="col-xl-5 col-lg-7 col-md-9">
                            <div class="authWrap">
                                <div class="authhead">
                                    <div class="text-center mb-4"><NuxtLink to="/"><img class="img-fluid" :src="logo" width="55" alt="logo"></NuxtLink></div>
                                </div>
                                <div class="authbody d-black mb-4">
                                    <div class="card rounded-4 p-sm-5 p-4">
                                        <div class="card-body p-0">
                                            <div class="text-center">
                                                <h1 class="mb-2 fs-2">Forgot Password?</h1>
                                                <p class="mb-0">Enter the email address associated with an account.</p>
                                            </div>
                                            <form class="mt-4 text-start">
                                                <div class="form py-4">
                                                    <div class="form-group form-border">
                                                        <label class="form-label">Enter email or user</label>
                                                        <input type="email" class="form-control" placeholder="name@example.com">
                                                    </div>
                                                    <div class="form-group">
                                                        <button type="submit" class="btn btn-primary full-width fw-medium">Reset Password</button>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                                <div class="authfooter">
                                    <div class="text-center">
                                        <p class="text-dark mb-0">Back to<NuxtLink to="/login" class="fw-medium text-primary"> Sign In</NuxtLink></p>
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

<script setup>
    import bg from '@/assets/img/auth-bg.png'
    import logo from '@/assets/img/icon.png'
</script>
