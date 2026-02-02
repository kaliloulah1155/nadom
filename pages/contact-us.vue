<template>
    <div>
        <ClientOnly>
            <NavbarDark />
        </ClientOnly>

        <section class="bg-cover position-relative" :style="{ backgroundImage: `url(${bg})` }" data-overlay="6">
            <div class="container">
                <div class="row align-items-center justify-content-center">
                    <div class="col-xl-7 col-lg-9 col-md-12">
                        <div class="fpc-capstion text-center my-4">
                            <div class="fpc-captions">
                                <h1 class="xl-heading text-light">Contact Us</h1>
                                <p class="text-lg text-light">Cicero famously orated against his political opponent Lucius Sergius Catilina.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row justify-content-between g-4 mt-lg-5 mt-4">
                    <div class="col-xl-4 col-lg-4 col-md-6">
                        <div class="card p-4 rounded-4 bg-transparents border-0 text-center h-100">
                            <div class="crds-icons d-inline-flex mx-auto mb-3 text-light fs-2"><i class="fa-solid fa-briefcase"></i></div>
                            <div class="crds-desc">
                                <h5 class="text-light">Drop a Mail</h5>
                                <p class="fs-6 text-md lh-2 text-light opacity-75 mb-0">ShreeThemes@gmail.com<br>ShreeThemes@gmail.com</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-lg-4 col-md-6">
                        <div class="card p-4 rounded-4 bg-transparents border-0 text-center h-100">
                            <div class="crds-icons d-inline-flex mx-auto mb-3 text-light fs-2"><i class="fa-solid fa-headset"></i></div>
                            <div class="crds-desc">
                                <h5 class="text-light">Call Us</h5>
                                <p class="fs-6 text-md lh-2 text-light opacity-75 mb-0">(0522) 2563568<br>+91 256 6548 457</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-4 col-lg-4 col-md-6">
                        <div class="card p-4 rounded-4 bg-transparents border-0 text-center h-100">
                            <div class="crds-icons d-inline-flex mx-auto mb-3 text-light fs-2"><i class="fa-solid fa-globe"></i></div>
                            <div class="crds-desc">
                                <h5 class="text-light">Connect with Social</h5>
                                <p class="text-md text-light opacity-75 lh-2">Let's Connect with Us via social media</p>
                                <ul class="list-inline mb-0">
                                    <li v-for="(item, index) in socialData" :key="index" class="list-inline-item">
                                        <NuxtLink class="square--40 circle bg-transparents text-light" to="#"><i :class="item"></i></NuxtLink> 
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section>
            <div class="container">
                <div class="row align-items-center justify-content-between g-4">
                    <div class="col-xl-7 col-lg-7 col-md-12">
                        <div class="contactForm pe-xl-5 pe-lg-4">
                            <form>
                                <div class="row align-items-center">
                                    <div class="col-xl-12 col-lg-12 col-md-12">
                                        <div class="touch-block d-flex flex-column mb-4">
                                            <h2>Drop Us a Line</h2>
                                            <p>Get in touch via form below and we will reply as soos as we can. </p>
                                        </div>
                                    </div>

                                    <div class="col-xl-6 col-lg-6 col-md-6">
                                        <div class="form-group form-border">
                                            <label class="form-label">Your Name</label>
                                            <input type="text" class="form-control bg-light">
                                        </div>
                                    </div>

                                    <div class="col-xl-6 col-lg-6 col-md-6">
                                        <div class="form-group form-border">
                                            <label class="form-label">eMail ID</label>
                                            <input type="email" class="form-control bg-light">
                                        </div>
                                    </div>

                                    <div class="col-xl-6 col-lg-6 col-md-6">
                                        <div class="form-group form-border">
                                            <label class="form-label">Phone No.</label>
                                            <input type="text" class="form-control bg-light">
                                        </div>
                                    </div>

                                    <div class="col-xl-6 col-lg-6 col-md-6">
                                        <div class="form-group form-border">
                                            <label class="form-label">Subject</label>
                                            <input type="text" class="form-control bg-light">
                                        </div>
                                    </div>

                                    <div class="col-xl-12 col-lg-12 col-md-12">
                                        <div class="form-group form-border">
                                            <label class="form-label">Your Query</label>
                                            <textarea class="form-control ht-120 bg-light"></textarea>
                                        </div>
                                    </div>

                                    <div class="col-xl-12 col-lg-12 col-md-12">
                                        <div class="form-group form-border">
                                            <button type="button" class="btn fw-medium btn-primary">Send Message<i class="fa-solid fa-paper-plane ms-2"></i></button>
                                        </div>
                                    </div>

                                    <div class="">
                                        <div class="">
                                            <div class="alert alert-success" role="alert">Message Sent Successfully To RealScout. You Will Get Response Soon.</div>
                                        </div>
                                    </div>

                                </div>
                            </form>
                        </div>
                    </div>
                    <div class="col-xl-5 col-lg-5 col-md-12">
                        <iframe class="full-width ht-100 grayscale rounded" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.9663095343008!2d-74.00425878428698!3d40.74076684379132!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259bf5c1654f3%3A0xc80f9cfce5383d5d!2sGoogle!5e0!3m2!1sen!2sin!4v1586000412513!5m2!1sen!2sin" height="500" style="border:0;" aria-hidden="false" tabindex="0"></iframe>
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
    import bg from '@/assets/img/title-banner.jpg'
    import { ref } from 'vue';
    const socialData = ref(['fa-brands fa-facebook-f', 'fa-brands fa-instagram', 'fa-brands fa-twitter', 'fa-brands fa-dribbble'])
</script>