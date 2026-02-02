<template>
    <div>
        <ClientOnly>
            <NavbarDark/>
        </ClientOnly>

        <section class="bg-cover position-relative" :style="{backgroundImage:`url(${bg})`, backgroundRepeat:'no-repeat'}" data-overlay="6">
            <div class="container">
                <div class="row justify-content-center align-items-center">
                    <div class="col-xl-7 col-lg-9 col-md-12 col-sm-12">
                        <div class="position-relative text-center mb-5 pt-lg-0 pt-5">
                            <h1 class="text-light xl-heading">About Page</h1>
                            <nav id="breadcrumbs" class="breadcrumbs light">
                                <ul>
                                    <li><NuxtLink to="#">Home</NuxtLink></li>
                                    <li><NuxtLink to="#">Pages</NuxtLink></li>
                                    <li>About Us</li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="pb-5">
            <div class="container">
                <div class="row">
                    <div class="row justify-content-center align-items-center">
                        <div class="col-xl-10 col-lg-11 col-md-12 col-sm-12">
                            <div class="secHeading-wrap text-center">
                                <h3 class="sectionHeading">How We Start <span class="text-primary">Work</span></h3>
                                <p>Explore our work process step by step and our mission</p>
                            </div>
                        </div>
                    </div>
                    <div class="row justify-content-between align-items-center g-4 mb-5">
                        <div class="col-xl-5 col-lg-5 col-md-6 col-sm-12">
                            <div class="missionImg">
                                <img :src="image" class="img-fluid" alt="">
                            </div>
                        </div>
                        <div class="col-xl-6 col-lg-6 col-md-6 col-sm-12">
                            <div class="missioncaps">
                                <div class="d-block mb-4">
                                    <div class="d-flex align-items-start mb-2"><span class="badge badge-xs badge-success rounded-pill">About Mission</span></div>
                                    <h2>Explore Our Aim & Mission</h2>
                                </div>
                                <p>Euismod ultricies sollicitudin. Curabitur sed dapibus nulla. Nulla eget iaculis lectus. Mauris ac maximus neque. Nam in mauris quis libero sodales eleifend. Morbi varius, nulla. Nulla posuere sapien vitae lectus suscipit, et pulvinar nisi tincidunt. Curabitur convallis fringilla diam sed aliquam. sit amet rutrum elementum, est elit finibus tellus, ut tristique elit risus at metus. Sed tempor iaculis massa faucibus feugiat.</p>
                                <p>Maecenas in pulvinar neque. Nulla finibus lobortis pulvinar. Donec a consectetur nulla. Nulla posuere sapien vitae lectus suscipit, et pulvinar nisi tincidunt. Curabitur convallis fringilla diam sed aliquam. Sed tempor iaculis massa faucibus feugiat. In fermentum facilisis massa, a consequat purus viverra. Aliquam erat volutpat. Curabitur convallis fringilla diam sed aliquam. Sed tempor iaculis massa faucibus feugiat. In fermentum facilisis massa.</p>
                                <div class="d-flex align-items-start mt-4">
                                    <NuxtLink to="#" class="btn btn-light-primary rounded-pill px-5">Meet Our Team</NuxtLink>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row justify-content-between align-items-center g-4 border-top">
                        <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-6">
                            <div class="counter-wrap text-center">
                                <h2 class="mb-0"><count-up class="ctr text-primary me-1 d-inline" :end-val="145">145</count-up>K</h2>
                                <p class="m-0">Daily New Visitors</p>
                            </div>
                        </div>
                        
                        <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-6">
                            <div class="counter-wrap text-center">
                                <h2 class="mb-0"><count-up class="ctr text-primary d-inline" :end-val="670">670</count-up></h2>
                                <p class="m-0">Active Listings</p>
                            </div>
                        </div>
                        
                        <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-6">
                            <div class="counter-wrap text-center">
                                <h2 class="mb-0"><count-up class="ctr text-primary d-inline" :end-val="22">22</count-up></h2>
                                <p class="m-0">Won Awards</p>
                            </div>
                        </div>
                        
                        <div class="col-xl-3 col-lg-3 col-md-6 col-sm-6 col-6">
                            <div class="counter-wrap text-center">
                                <h2 class="mb-0"><count-up class="ctr text-primary me-1 d-inline" :end-val="642">642</count-up>K</h2>
                                <p class="m-0">Happy Customers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section class="bg-cover" :style="{backgroundImage:`url(${bg2})`, backgroundColor:'#ffffff' , backgroundRepeat:'no-repeat'}" data-overlay="5">
            <div class="container">
                <div class="row">
                    <div class="row justify-content-center align-items-center mb-5">
                        <div class="col-xl-12 col-lg-12 col-md-12 col-sm-12">
                            <div class="position-relative text-center py-5">
                                <div class="promoTitle d-flex align-items-center justify-content-center">
                                    <span class="badge badge-xs badge-transparent rounded-pill">Get Help with Promo Videos</span>
                                </div>
                                <div class="promoHeading mb-5 mt-4">
                                    <h2 class="text-light">Embark on your thrilling adventure with us.</h2>
                                    <h3 class="text-light">Our agency will guide you through the captivating realm of digital innovation.</h3>
                                </div>
                                <div class="promoButtons">
                                    <button type="button" class="btn btn-whites fw-medium rounded-pill px-4"><i class="bi bi-play-circle-fill me-2"></i>Watch Promo Video</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section>
            <div class="container">
                <div class="row justify-content-center align-items-center">
                    <div class="col-xl-10 col-lg-11 col-md-12 col-sm-12">
                        <div class="secHeading-wrap text-center">
                            <h3 class="sectionHeading">Our Working <span class="text-primary">Process</span></h3>
                            <p>Explore our work process step by step and our mission</p>
                        </div>
                    </div>
                </div>
                
                <div class="row justify-content-center g-md-5 g-4">
                    <div v-for="(item, index) in aboutOne" :key="index" class="col-xl-4 col-lg-4 col-md-6">
                        <div class="processWrap px-xl-4">
                            <div class="text-center">
                                <div class="processIcons d-block">
                                    <div class="Icons">
                                        <i :class="item.icon"></i>
                                    </div>
                                </div>
                                <div class="processCaps">
                                    <h4 class="fw-medium">{{item.title}}</h4>
                                    <p class="m-0">{{item.desc}}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-xl-12 col-lg-12 col-md-12">
                        <div class="d-flex align-items-center justify-content-center mt-4">
                            <NuxtLink to="#" class="btn btn-light-primary rounded-pill px-5">View More Details<i class="bi bi-caret-right ms-2"></i></NuxtLink>
                        </div>
                    </div>
                </div>				
            </div>
        </section>

        <section class="bg-light">
            <div class="container">
                <div class="row align-items-center justify-content-center">
                    <div class="col-xl-7 col-lg-8 col-md-11 col-sm-12">
                        <div class="secHeading-wrap text-center">
                            <h3 class="sectionHeading">Our Great <span class="text-primary">Reviews</span></h3>
                            <p>Our cliens love our services and give great & positive reviews</p>
                        </div>
                    </div>
                </div>
                <ClientOne/>
            </div>
        </section>

        <section>
            <div class="container">
                <div class="row align-items-center justify-content-center">
                    <div class="col-xl-7 col-lg-8 col-md-11 col-sm-12">
                        <div class="secHeading-wrap text-center">
                            <h3 class="sectionHeading">Meet Our Great <span class="text-primary">Experts</span></h3>
                            <p>Explore our team and contact for any types of help if you needs.</p>
                        </div>
                    </div>
                </div>
                <TeamOne/>
            </div>
        </section>

        <FooterTop/>
        <FooterOne/>
        <BackToTop/>
    </div>
</template>

<script setup>
import image from '@/assets/img/side-img.png'
import bg from '@/assets/img/title-banner.jpg'
import bg2 from '@/assets/img/banner-2.jpg'
import CountUp from 'vue-countup-v3'
import { ref } from 'vue';

const aboutOne = ref([
    {
        icon:'bi bi-pin-map-fill',
        title:'Explore Best Place',
        desc:'Reviewers tend to be distracted by presented with the actual comprehensible content often happens that private corporate clients corder.'
    },
    {
        icon:'bi bi-send-check',
        title:'Contact Listing Author',
        desc:'Reviewers tend to be distracted by presented with the actual comprehensible content often happens that private corporate clients corder.'
    },
    {
        icon:'bi bi-person-check',
        title:'Make Your Reservation',
        desc:'Reviewers tend to be distracted by presented with the actual comprehensible content often happens that private corporate clients corder.'
    },
])
</script>
