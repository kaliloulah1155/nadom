<template>
    <div class="user-dashboard-inner h-100 border-end border-2 py-5 p-3 d-lg-block d-none">
        <div class="dashboard_users mb-4">
            <div class="square--80 circle mx-auto mb-1"><img :src="user" class="img-fluid circle" alt="User Image"></div>
            <div class="user-nameTitle text-center">
                <h4 class="lh-base fw-semibold text-light mb-0">Welcome Back</h4>
                <h6 class="text-light fw-medium opacity-75 mb-0">Themez Hub</h6>
            </div>
        </div>
        <div class="dashboard_Menu">
            <ul>
                <li><NuxtLink to="/dashboard-user" :class="current === '/dashboard-user' ? 'active' : '' "><i class="bi bi-speedometer me-2"></i>Dashboard Area</NuxtLink></li>
                <li><NuxtLink to="/dashboard-my-profile" :class="current === '/dashboard-my-profile' ? 'active' : '' "><i class="bi bi-person-lines-fill me-2"></i>My Profile</NuxtLink></li>
                <li><NuxtLink to="/dashboard-my-bookings" :class="current === '/dashboard-my-bookings' ? 'active' : '' "><i class="bi bi-journal-check me-2"></i>My Bookings</NuxtLink></li>
                <li><NuxtLink to="/dashboard-my-listings" :class="current === '/dashboard-my-listings' ? 'active' : '' "><i class="bi bi-ui-radios-grid me-2"></i>My Listings</NuxtLink></li>
                <li><NuxtLink to="/dashboard-bookmarks" :class="current === '/dashboard-bookmarks' ? 'active' : '' "><i class="bi bi-bookmark-star me-2"></i>Bookmarkes</NuxtLink></li>
                <li><NuxtLink to="/dashboard-messages" :class="current === '/dashboard-messages' ? 'active' : '' "><i class="bi bi-chat-dots me-2"></i>Messages<span class="notti_coun style-1">3</span></NuxtLink></li>
                <li><NuxtLink to="/dashboard-reviews" :class="current === '/dashboard-reviews' ? 'active' : '' "><i class="bi bi-yelp me-2"></i>Reviews</NuxtLink></li>
                <li><NuxtLink to="/dashboard-wallet" :class="current === '/dashboard-wallet' ? 'active' : '' "><i class="bi bi-wallet me-2"></i>Wallet</NuxtLink></li>
                <li><NuxtLink to="/dashboard-add-listing" :class="current === '/dashboard-add-listing' ? 'active' : '' "><i class="bi bi-patch-plus me-2"></i>Add Listing</NuxtLink></li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import user from '@/assets/img/team-2.jpg'
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const router = useRoute();

const current = ref(router.fullPath);
</script>
