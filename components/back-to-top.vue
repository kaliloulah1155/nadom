<template>
    <NuxtLink id="back2Top" @click="scrollToTop" class="top-scroll" :class="scroll ? 'd-block' : 'd-none'"  title="Back to top" to="#"><i class="fa-solid fa-arrow-up d-flex align-items-center justify-content-center h-100"></i></NuxtLink>
</template>

<script setup>
    import { onMounted, ref } from 'vue';

    const scroll = ref(false)

    const scrollToTop = () =>{
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    const handleScroll = () => {
        if (window.scrollY >= 50) {
            scroll.value = true
        } else {
            scroll.value = false
        }
    }

    onMounted(()=>{
		window.addEventListener('scroll', handleScroll);
	})
    
</script>