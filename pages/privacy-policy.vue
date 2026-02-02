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
                            <h1 class="xl-heading">Privacy Policy</h1>
                            <nav id="breadcrumbs" class="breadcrumbs">
                                <ul>
                                    <li><NuxtLink to="#">Home</NuxtLink></li>
                                    <li><NuxtLink to="#">Pages</NuxtLink></li>
                                    <li>Privacy</li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section>
            <div class="container">
                <div class="row justify-content-start g-4">
                    <div class="col-xl-10 col-lg-12 col-md-12">
                        <article class="article">
                            <h2>Privacy & Policy</h2>
                            <p>When ordering or registering on our Site you may be asked to enter your name, member name, email address, mailing address, country, billing information or other details to help you with your experience. These information are collected in purpose of providing services described on it, like to verify your identity when you sign in to website, to process your transactions made on site, to respond to support tickets and offer customer services, for administrative and accounting needs that we required to provide to government. When you submit a support question we collect your first name, last name and your email address so that we can correspond with you.</p>
                            <p></p>

                            <div v-for="(item, index) in policyData" :key="index">
                                <h4 class="fs-4">{{item.title}}</h4>
                                <p>{{item.desc}}</p>
                            </div>
                        </article>
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
import { ref } from 'vue';

const policyData = ref([
    {
        title:'Google Analytics',
        desc:`In a professional context it often happens that private or corporate clients corder a publication to be made and presented with the actual content still not being ready. Think of a news blog that's filled with content hourly on the day of going live. However, reviewers tend to be distracted by comprehensible content, say, a random text copied from a newspaper or the internet.`
    },
    {
        title:'Who we share your data with',
        desc:`In a professional context it often happens that private or corporate clients corder a publication to be made and presented with the actual content still not being ready. Think of a news blog that's filled with content hourly on the day of going live. However, reviewers tend to be distracted by comprehensible content, say, a random text copied from a newspaper or the internet.`
    },
    {
        title:'Embedded content from other websites',
        desc:`In a professional context it often happens that private or corporate clients corder a publication to be made and presented with the actual content still not being ready. Think of a news blog that's filled with content hourly on the day of going live. However, reviewers tend to be distracted by comprehensible content, say, a random text copied from a newspaper or the internet.`
    },
    {
        title:'How long we retain your data',
        desc:`In a professional context it often happens that private or corporate clients corder a publication to be made and presented with the actual content still not being ready. Think of a news blog that's filled with content hourly on the day of going live. However, reviewers tend to be distracted by comprehensible content, say, a random text copied from a newspaper or the internet.`
    },
    {
        title:'Changes to this privacy policy',
        desc:`In a professional context it often happens that private or corporate clients corder a publication to be made and presented with the actual content still not being ready. Think of a news blog that's filled with content hourly on the day of going live. However, reviewers tend to be distracted by comprehensible content, say, a random text copied from a newspaper or the internet.`
    },
])
</script>