<template>
    <div>
        <ClientOnly>
            <NavbarDark/>
        </ClientOnly>

        <section class="bg-light">
            <div class="container">
                <div class="row justify-content-start align-items-center">
                    <div class="col-xl-7 col-lg-9 col-md-12 col-sm-12">
                        <div class="position-relative pt-lg-0 pt-5">
                            <h1 class="xl-heading">404 Not Found</h1>
                            <nav id="breadcrumbs" class="breadcrumbs">
                                <ul>
                                    <li><NuxtLink to="#">Home</NuxtLink></li>
                                    <li><NuxtLink to="#">Pages</NuxtLink></li>
                                    <li>Eroor</li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        <section class="position-relative">
            <div class="container">
                <div class="row align-items-center justify-content-center">
                    <div class="col-xl-7 col-lg-8 col-md-12">
                        <div class="404-capstion text-center my-4">
                            <div class="404-captions mb-5">
                                <img :src="error" class="img-fluid mb-3" alt="">
                                <h2>Ohhh ho, something went wrong!</h2>
                                <p class="fs-6">Cicero famously orated against his political opponent.</p>
                            </div>
                            <div class="backHome">
                                <NuxtLink to="/" class="btn btn-lg btn-light-primary fw-medium rounded-pill">Back to Home</NuxtLink>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>

        <FooterTop/>
        <FooterOne/>
        <BackToTop/>
    </div>
</template>

<script setup>
    import error from '@/assets/img/error.svg'
</script>

<style lang="scss" scoped>

</style>