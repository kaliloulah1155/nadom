<template>

    <div class="bg-cover" :style="{backgroundImage:`url(${bg})`, backgroundColor:'#ffe8ee', backgroundRepeat:'no-repeat'}">
        <div id="main-wrapper">
            <section>
                <div class="container">
                    <div class="row align-items-center justify-content-center">
                        <div class="col-xl-5 col-lg-7 col-md-9">
                            <div class="authWrap">
                                <div class="authhead">
                                    <div class="text-center mb-4"><NuxtLink to="/"><img class="img-fluid" :src="logo" width="55" alt="logo"/></NuxtLink></div>
                                </div>

                                <div class="authbody d-black mb-4">
                                    <div class="card rounded-4 p-sm-5 p-4">
                                        <div class="card-body p-0">
                                            <div class="text-center">
                                                <h1 class="mb-2 fs-2">Create An Account!</h1>
                                            </div>
                                            <form class="mt-5 text-start">
                                                <div class="form mb-5">
                                                    <div class="form-group form-border">
                                                        <label class="form-label">User or Email</label>
                                                        <input type="email" class="form-control" placeholder="name@example.com">
                                                    </div>
                                                    <div class="form-group form-border">
                                                        <label class="form-label">Enter Password</label>
                                                        <div class="position-relative">
                                                            <input type="password" class="form-control" id="password-field" name="password" placeholder="Password">
                                                            <span class="fa-solid fa-eye toggle-password position-absolute top-50 end-0 translate-middle-y me-3"></span>
                                                        </div>
                                                    </div>

                                                    <div class="form-group form-border">
                                                        <label class="form-label">Confirm Password</label>
                                                        <input type="password" class="form-control" placeholder="*********">
                                                    </div>

                                                    <div class="form-group mb-4">
                                                        <button type="submit" class="btn btn-primary full-width fw-medium">Create Account</button>
                                                    </div>

                                                    <div
                                                        class="modal-flex-item d-flex align-items-center justify-content-between mb-3">
                                                        <div class="modal-flex-first">
                                                            <div class="form-check form-check-inline">
                                                                <input class="form-check-input" type="checkbox" id="savepassword" value="option1">
                                                                <label class="form-check-label" for="savepassword">Save Password</label>
                                                            </div>
                                                        </div>
                                                        <div class="modal-flex-last">
                                                            <NuxtLink to="/forgot-password" class="text-primary fw-medium">Forget Password?</NuxtLink>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="prixer my-5">
                                                    <div class="devider-wraps position-relative">
                                                        <div class="devider-text text-muted text-md">Or Signup with</div>
                                                    </div>
                                                </div>

                                                <div class="social-login">
                                                    <div class="d-flex align-items-center justify-content-center flex-wrap gap-3 p-0">
                                                        <div class="flex-first flex-fill mob-100">
                                                            <NuxtLink to="#" class="btn bg-white border border-2 text-dark full-width">
                                                                <i class="fa-brands fa-google-plus-g color--googleplus me-2"></i>
                                                                <span class="fw-medium text-md">Signup with Google</span>
                                                            </NuxtLink>
                                                        </div>
                                                        <div class="flex-last flex-fill mob-100">
                                                            <NuxtLink to="#" class="btn bg-white border border-2 text-dark full-width">
                                                                <i class="fa-brands fa-facebook color--facebook me-2"></i>
                                                                <span class="fw-medium text-md">Signup with Facebook</span>
                                                            </NuxtLink>
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>

                                <div class="authfooter">
                                    <div class="text-center">
                                        <p class="text-dark mb-0">Already an account?<NuxtLink to="/login" class="fw-medium text-primary"> Login Here</NuxtLink></p>
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

<style lang="scss" scoped></style>