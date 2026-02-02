import brand1 from '@/assets/img/brand/logo-1.png'
import brand2 from '@/assets/img/brand/logo-2.png'
import brand3 from '@/assets/img/brand/logo-3.png'
import brand4 from '@/assets/img/brand/logo-4.png'
import brand5 from '@/assets/img/brand/logo-5.png'
import brand6 from '@/assets/img/brand/logo-6.png'

import cats1 from '@/assets/img/cats/catt-1.jpg'
import cats2 from '@/assets/img/cats/catt-2.jpg'
import cats3 from '@/assets/img/cats/catt-3.jpg'
import cats4 from '@/assets/img/cats/catt-4.jpg'
import cats5 from '@/assets/img/cats/catt-5.jpg'
import cats6 from '@/assets/img/cats/catt-6.jpg'
import cats7 from '@/assets/img/cats/catt-7.jpg'
import cats8 from '@/assets/img/cats/catt-8.jpg'
import cats9 from '@/assets/img/cats/catt-9.jpg'
import cats10 from '@/assets/img/cats/catt-10.jpg'

import list1 from '@/assets/img/list-1.jpg'
import list2 from '@/assets/img/list-2.jpg'
import list3 from '@/assets/img/list-3.jpg'
import list4 from '@/assets/img/list-4.jpg'
import list5 from '@/assets/img/list-5.jpg'
import list6 from '@/assets/img/list-6.jpg'
import list7 from '@/assets/img/list-7.jpg'
import list8 from '@/assets/img/list-8.jpg'
import list9 from '@/assets/img/list-9.jpg'

import team1 from '@/assets/img/team-1.jpg'
import team2 from '@/assets/img/team-2.jpg'
import team3 from '@/assets/img/team-3.jpg'
import team4 from '@/assets/img/team-4.jpg'
import team5 from '@/assets/img/team-5.jpg'
import team6 from '@/assets/img/team-6.jpg'
import team7 from '@/assets/img/team-7.jpg'
import team8 from '@/assets/img/team-8.jpg'
import team9 from '@/assets/img/team-9.jpg'

import blog1 from '@/assets/img/blog-1.jpg'
import blog2 from '@/assets/img/blog-2.jpg'
import blog3 from '@/assets/img/blog-3.jpg'
import blog4 from '@/assets/img/blog-4.jpg'
import blog5 from '@/assets/img/blog-5.jpg'
import blog6 from '@/assets/img/blog-6.jpg'

import city1 from '@/assets/img/city/location-1.jpg'
import city2 from '@/assets/img/city/location-2.jpg'
import city3 from '@/assets/img/city/location-3.jpg'
import city4 from '@/assets/img/city/location-4.jpg'
import city5 from '@/assets/img/city/location-5.jpg'
import city6 from '@/assets/img/city/location-6.jpg'

import event1 from '@/assets/img/eve-1.jpg'
import event2 from '@/assets/img/eve-2.jpg'
import event3 from '@/assets/img/eve-3.jpg'

import review1 from '@/assets/img/google.png'
import review2 from '@/assets/img/trustpilot.png'
import review3 from '@/assets/img/capterra.png'

export const brandImage = [
    brand1,brand2,brand3,brand4,brand5,brand6,brand1,brand2,
]

export const categoryData = [
    {
        image:cats1,
        icon:'bi bi-backpack',
        title:'Showroom',
        list:'103 Lists'
    },
    {
        image:cats2,
        icon:'bi bi-basket2',
        title:'Fashion & Beauty',
        list:'75 Lists'
    },
    {
        image:cats3,
        icon:'bi bi-house-check',
        title:'Real Estate',
        list:'16 Lists'
    },
    {
        image:cats4,
        icon:'fa-solid fa-dumbbell',
        title:'Health & Fitness',
        list:'110 Lists'
    },
    {
        image:cats5,
        icon:'bi bi-shop',
        title:'Business Shp',
        list:'120 Lists'
    },
    {
        image:cats6,
        icon:'bi bi-cup-straw',
        title:'Restaurants',
        list:'69 Lists'
    },
    {
        image:cats7,
        icon:'bi bi-lungs',
        title:'Hospital & Med',
        list:'78 Lists'
    },
    {
        image:cats8,
        icon:'bi bi-lamp',
        title:'Wedding & Events',
        list:'75 Lists'
    },
    {
        image:cats9,
        icon:'bi bi-mortarboard',
        title:'Education',
        list:'16 Lists'
    },
    {
        image:cats10,
        icon:'bi bi-cup-hot',
        title:'Coffe Shop',
        list:'62 Lists'
    },
    {
        image:cats1,
        icon:'bi bi-layers',
        title:'Account Finance',
        list:'35 Lists'
    },
    {
        image:cats2,
        icon:'bi bi-code-slash',
        title:'Web Development',
        list:'120 Lists'
    },
]

export const listData = [
    {
        id:1,
        image:list1,
        user:team1,
        status:'open',
        featured:true,
        title:'The Big Bumbble Gym',
        desc:'Cicero famously orated against his political.',
        call:'+42 515 635 4758',
        loction:'Tokyo Japan',
        tag:'Fitness',
        tagIcon:'fa-solid fa-dumbbell',
        tagIconStyle:'catIcon me-2 cats-1',
        review:'46 Reviews',
        rating:'good',
        ratingRate:'4.5',
        instantBooking:false
    },
    {
        id:2,
        image:list2,
        user:team2,
        status:'open',
        featured:false,
        title:'Greenvally Real Estate',
        desc:'Cicero famously orated against his political.',
        call:'+42 515 635 6150',
        loction:'Paris France',
        tag:'Real Estate',
        tagIcon:'bi bi-house-check',
        tagIconStyle:'catIcon me-2 cats-2',
        review:'35 Reviews',
        rating:'midium',
        ratingRate:'4.3',
        instantBooking:true
    },
    {
        id:3,
        image:list3,
        user:team3,
        status:'closed',
        featured:true,
        title:'Shree Wedding Planner',
        desc:'Cicero famously orated against his political.',
        call:'+42 515 635 4785',
        loction:'Toronto Canada',
        tag:'Weddings',
        tagIcon:'bi bi-lamp',
        tagIconStyle:'catIcon me-2 cats-3',
        review:'12 Reviews',
        rating:'excellent',
        ratingRate:'4.8',
        instantBooking:false
    },
    {
        id:4,
        image:list4,
        user:team4,
        status:'open',
        featured:false,
        title:'The Blue Ley Light',
        desc:'Cicero famously orated against his political.',
        call:'+42 515 635 6358',
        loction:'Sydney Australia',
        tag:'Restaurant',
        tagIcon:'bi bi-cup-straw',
        tagIconStyle:'catIcon me-2 cats-4',
        review:'72 Reviews',
        rating:'good',
        ratingRate:'4.6',
        instantBooking:true
    },
    {
        id:5,
        image:list5,
        user:team5,
        status:'close',
        featured:true,
        title:'Shreya Study Center',
        desc:'Cicero famously orated against his political.',
        call:'+42 515 635 0210',
        loction:'Berlin Germany',
        tag:'Education',
        tagIcon:'bi bi-mortarboard',
        tagIconStyle:'catIcon me-2 cats-5',
        review:'112 Reviews',
        rating:'midium',
        ratingRate:'4.2',
        instantBooking:false
    },
    {
        id:6,
        image:list6,
        user:team6,
        status:'open',
        featured:false,
        title:'Mahroom Garage & Workshop',
        desc:'Cicero famously orated against his political.',
        call:'+42 515 635 3251',
        loction:'Moscow Russia',
        tag:'Showroom',
        tagIcon:'bi bi-backpack',
        tagIconStyle:'catIcon me-2 cats-6',
        review:'52 Reviews',
        rating:'excellent',
        ratingRate:'4.8',
        instantBooking:true
    },
    {
        id:7,
        image:list7,
        user:team7,
        status:'open',
        featured:true,
        title:'Creative Wedding Planner',
        desc:'Cicero famously orated against his political.',
        call:'+42 515 635 4758',
        loction:'Rome Italy',
        tag:'Wedding',
        tagIcon:'fa-solid fa-dumbbell',
        tagIconStyle:'catIcon me-2 cats-1',
        review:'46 Reviews',
        rating:'good',
        ratingRate:'4.5',
        instantBooking:false
    },
    {
        id:8,
        image:list8,
        user:team8,
        status:'close',
        featured:true,
        title:'The Great Dream Palace',
        desc:'Cicero famously orated against his political.',
        call:'+42 515 635 5426',
        loction:'Mumbai India',
        tag:'Spa',
        tagIcon:'bi bi-cup-hot',
        tagIconStyle:'catIcon me-2 cats-1',
        review:'42 Reviews',
        rating:'excellent',
        ratingRate:'4.9',
        instantBooking:true
    },
    {
        id:9,
        image:list9,
        user:team9,
        status:'open',
        featured:true,
        title:'Agroo Spa & Massage Center',
        desc:'Cicero famously orated against his political.',
        call:'+42 515 635 2136',
        loction:'Athens Greece',
        tag:'Eat & Drink ',
        tagIcon:'bi bi-basket2',
        tagIconStyle:'catIcon me-2 cats-8',
        review:'76 Reviews',
        rating:'good',
        ratingRate:'4.7',
        instantBooking:false
    },
]

export const reviewData = [
    {
        rate:['fa-solid fa-star','fa-solid fa-star','fa-solid fa-star','fa-solid fa-star','fa-solid fa-star'],
        title:'"One of the Superb Platform"',
        desc:`Absolutely love Advertize! whenever I'm in need of finding a job, Advertize is my #1 go to! wouldn't look anywhere else.`,
        image:team1,
        name:'Aman Diwakar',
        position:'General Manager'
    },
    {
        rate:['fa-solid fa-star','fa-solid fa-star','fa-solid fa-star','fa-solid fa-star','fa-solid fa-star'],
        title:'"One of the Superb Platform"',
        desc:`Overall, the Advertize application is a powerful tool for anyone in the job market. Its reliability, extensive job listings, and user-friendly..`,
        image:team2,
        name:'Ridhika K. Sweta',
        position:'CEO of Agreeo'
    },
    {
        rate:['fa-solid fa-star','fa-solid fa-star','fa-solid fa-star','fa-solid fa-star','fa-solid fa-star'],
        title:'"One of the Superb Platform"',
        desc:`I love this Advertize app. it's more legit than the other ones with advertisement. Once I uploaded my resume, then employers...`,
        image:team3,
        name:'Shushil Kumar Yadav',
        position:'Brand Manager'
    },
    {
        rate:['fa-solid fa-star','fa-solid fa-star','fa-solid fa-star','fa-solid fa-star','fa-solid fa-star'],
        title:'"One of the Superb Platform"',
        desc:`Advertize the best job finder app out there right now.. they also protect you from spammers so the only emails I get due to...`,
        image:team4,
        name:'Ritika K. Mishra',
        position:'HR Head at Google'
    },
    {
        rate:['fa-solid fa-star','fa-solid fa-star','fa-solid fa-star','fa-solid fa-star','fa-solid fa-star'],
        title:'"One of the Superb Platform"',
        desc:`Advertize the best job finder app out there right now.. they also protect you from spammers so the only emails I get due to...`,
        image:team5,
        name:'Shree K. Patel',
        position:'Chief Executive'
    },
    {
        rate:['fa-solid fa-star','fa-solid fa-star','fa-solid fa-star','fa-solid fa-star','fa-solid fa-star'],
        title:'"One of the Superb Platform"',
        desc:`Advertize the best job finder app out there right now.. they also protect you from spammers so the only emails I get due to...`,
        image:team6,
        name:'Sarwan Kumar Patel',
        position:'Chief Executive'
    },
]

export const blogData = [
    {
        id:1,
        image:blog2,
        title:'10 Must-Have Bootstrap Templates for Modern Web Design',
        desc:"Think of a news blog that's filled with content political against opponent Lucius Sergius Catilina. Hourly on the day of going live.",
        date:'13th Sept 2025',
        views:'12k Views'
    },
    {
        id:2,
        image:blog3,
        title:'Top 5 Bootstrap Themes for E-commerce Websites.',
        desc:"Think of a news blog that's filled with content political against opponent Lucius Sergius Catilina. Hourly on the day of going live.",
        date:'29th Nov 2025',
        views:'33k Views'
    },
    {
        id:3,
        image:blog4,
        title:'The Ultimate Guide to Customizing Bootstrap Templates',
        desc:"Think of a news blog that's filled with content political against opponent Lucius Sergius Catilina. Hourly on the day of going live.",
        date:'13th March 2025',
        views:'15k Views'
    },
    {
        id:4,
        image:blog5,
        title:'Top 10 Free Bootstrap Templates for Your Next Project',
        desc:"Think of a news blog that's filled with content political against opponent Lucius Sergius Catilina. Hourly on the day of going live.",
        date:'5th May 2025',
        views:'12k Views'
    },
    {
        id:5,
        image:blog6,
        title:'Creating Stunning Landing Pages with Bootstrap: Best Practices',
        desc:"Think of a news blog that's filled with content political against opponent Lucius Sergius Catilina. Hourly on the day of going live.",
        date:'19th June 2025',
        views:'33k Views'
    },
    {
        id:6,
        image:blog1,
        title:'The Benefits of Using Bootstrap for Your Web Development Projects',
        desc:"Think of a news blog that's filled with content political against opponent Lucius Sergius Catilina. Hourly on the day of going live.",
        date:'20th June 2025',
        views:'15k Views'
    },
]

export const footerSocial = [
    'fa-brands fa-facebook-f',
    'fa-brands fa-twitter',
    'fa-brands fa-instagram',
    'fa-brands fa-linkedin',
]
export const footerLink1 = [
    "About ListingHub",
    "Submit Listing",
    "ListingHub Report",
    "Careers",
]
export const footerLink2 = [
    "Trust & Safety",
    "Investor Relations",
    "Connect Guidelines",
    "Terms of Services",
    "Paid Advertising",
    "ListingHub Blog",
]
export const footerLink3 = [
    "ListingHub for Business",
    "Advertise on ListingHub",
    "Connect Guidelines",
    "Terms of Services",
    "Paid Advertising",
    "ListingHub Blog",
]
export const cityData = [
    {
        image:city1,
        gridClass:'col-xl-6 col-lg-6 col-md-4 col-sm-6',
        listing:'16 Listing',
        name:'Jersey City',
        tag:['San Diego','New York','Dallas','Denver']
    },
    {
        image:city2,
        gridClass:'col-xl-3 col-lg-3 col-md-4 col-sm-6',
        listing:'24 Listing',
        name:'San Diego',
        tag:['San Diego','New York','Dallas','Denver']
    },
    {
        image:city3,
        gridClass:'col-xl-3 col-lg-3 col-md-4 col-sm-6',
        listing:'30 Listing',
        name:'New Orleans',
        tag:['San Diego','New York','Dallas','Denver']
    },
    {
        image:city4,
        gridClass:'col-xl-3 col-lg-3 col-md-4 col-sm-6',
        listing:'10 Listing',
        name:'San Antonio',
        tag:['San Diego','New York','Dallas','Denver']
    },
    {
        image:city5,
        gridClass:'col-xl-3 col-lg-3 col-md-4 col-sm-6',
        listing:'22 Listing',
        name:'Los Angeles',
        tag:['San Diego','New York','Dallas','Denver']
    },
    {
        image:city6,
        gridClass:'col-xl-6 col-lg-6 col-md-4 col-sm-6',
        listing:'12 Listing',
        name:'San Francisco',
        tag:['San Diego','New York','Dallas','Denver']
    },
]
export const eventOne = [
    {
        image:event1,
        tagstyle:'badge badge-xs badge-danger',
        tag:'Cooking',
        title:'Learn Cooc with Shree Patel',
        time:'10:30 AM To 14:40 PM',
        date:'13',
        month:'Sept'
    },
    {
        image:event2,
        tagstyle:'badge badge-xs badge-success',
        tag:'Nightlife',
        title:'Enjoy with Adobe Ceremoney',
        time:'20:0 AM To 22:30 PM',
        date:'29',
        month:'Nov'
    },
    {
        image:event3,
        tagstyle:'badge badge-xs badge-warning',
        tag:'Workshop',
        title:'Join AI Community Workshop',
        time:'8:30 AM To 12:20 PM',
        date:'29',
        month:'Dec'
    },
]
export const workData = [
    {
        icon:'bi bi-pin-map fs-2',
        title:'Find Your Dream Place',
        desc:'Cicero famously orated against his political opponent Lucius wow abutere Sergius Catilina. Occasionally the first Oration.'
    },
    {
        icon:'bi bi-envelope-at fs-2',
        title:'Contact Listing Owners',
        desc:'Cicero famously orated against his political opponent Lucius wow abutere Sergius Catilina. Occasionally the first Oration.'
    },
    {
        icon:'bi bi-patch-check fs-2',
        title:'Make Your Reservation',
        desc:'Cicero famously orated against his political opponent Lucius wow abutere Sergius Catilina. Occasionally the first Oration.'
    },
]

export const review = [
    {
        image:review1,
        rate:[
            'fa-solid fa-star text-warning',
            'fa-solid fa-star text-warning',
            'fa-solid fa-star text-warning',
            'fa-solid fa-star text-warning',
            'fa-solid fa-star-half-stroke text-warning',
        ],
        review:'422k Reviews'
    },
    {
        image:review2,
        rate:[
            'fa-solid fa-star text-warning',
            'fa-solid fa-star text-warning',
            'fa-solid fa-star text-warning',
            'fa-solid fa-star text-warning',
            'fa-solid fa-star-half-stroke text-warning',
        ],
        review:'422k Reviews'
    },
    {
        image:review3,
        rate:[
            'fa-solid fa-star text-warning',
            'fa-solid fa-star text-warning',
            'fa-solid fa-star text-warning',
            'fa-solid fa-star text-warning',
            'fa-solid fa-star-half-stroke text-warning',
        ],
        review:'422k Reviews'
    },
]

export const teamData = [
    {
        image:team1,
        name:'Julia F. Mitchell',
        position:'Chief Executive',
        social:[
            {
              iconStyle:'color--facebook fs-5',
              icon:'bi bi-facebook'  
            },
            {
              iconStyle:'color--twitter fs-5',
              icon:'bi bi-twitter'  
            },
            {
              iconStyle:'color--instagram fs-5',
              icon:'bi bi-instagram'  
            },
            {
              iconStyle:'color--pinterest fs-5',
              icon:'bi bi-pinterest'  
            },
        ]
    },
    {
        image:team2,
        name:'Maria P. Thomas',
        position:'Co-Founder',
        social:[
            {
              iconStyle:'color--facebook fs-5',
              icon:'bi bi-facebook'  
            },
            {
              iconStyle:'color--twitter fs-5',
              icon:'bi bi-twitter'  
            },
            {
              iconStyle:'color--instagram fs-5',
              icon:'bi bi-instagram'  
            },
            {
              iconStyle:'color--pinterest fs-5',
              icon:'bi bi-pinterest'  
            },
        ]
    },
    {
        image:team3,
        name:'Willa R. Fontaine',
        position:'Field Manager',
        social:[
            {
              iconStyle:'color--facebook fs-5',
              icon:'bi bi-facebook'  
            },
            {
              iconStyle:'color--twitter fs-5',
              icon:'bi bi-twitter'  
            },
            {
              iconStyle:'color--instagram fs-5',
              icon:'bi bi-instagram'  
            },
            {
              iconStyle:'color--pinterest fs-5',
              icon:'bi bi-pinterest'  
            },
        ]
    },
    {
        image:team4,
        name:'Rosa R. Anderson',
        position:'Business Executive',
        social:[
            {
              iconStyle:'color--facebook fs-5',
              icon:'bi bi-facebook'  
            },
            {
              iconStyle:'color--twitter fs-5',
              icon:'bi bi-twitter'  
            },
            {
              iconStyle:'color--instagram fs-5',
              icon:'bi bi-instagram'  
            },
            {
              iconStyle:'color--pinterest fs-5',
              icon:'bi bi-pinterest'  
            },
        ]
    },
    {
        image:team5,
        name:'Jacqueline J. Miller',
        position:'Account Manager',
        social:[
            {
              iconStyle:'color--facebook fs-5',
              icon:'bi bi-facebook'  
            },
            {
              iconStyle:'color--twitter fs-5',
              icon:'bi bi-twitter'  
            },
            {
              iconStyle:'color--instagram fs-5',
              icon:'bi bi-instagram'  
            },
            {
              iconStyle:'color--pinterest fs-5',
              icon:'bi bi-pinterest'  
            },
        ]
    },
    {
        image:team6,
        name:'Oralia R. Castillo',
        position:'Writing Manager',
        social:[
            {
              iconStyle:'color--facebook fs-5',
              icon:'bi bi-facebook'  
            },
            {
              iconStyle:'color--twitter fs-5',
              icon:'bi bi-twitter'  
            },
            {
              iconStyle:'color--instagram fs-5',
              icon:'bi bi-instagram'  
            },
            {
              iconStyle:'color--pinterest fs-5',
              icon:'bi bi-pinterest'  
            },
        ]
    },
]

export const recentBlog = [
    {
        image:blog1,
        title:'Top 10 Free Bootstrap Templates for Your Next Project',
        date:'13th March 2025'
    },
    {
        image:blog2,
        title:'Top 10 Free Bootstrap Templates for Your Next Project',
        date:'5th May 2025'
    },
    {
        image:blog3,
        title:'Top 10 Free Bootstrap Templates for Your Next Project',
        date:'19th June 2025'
    },
    {
        image:blog4,
        title:'Top 10 Free Bootstrap Templates for Your Next Project',
        date:'20th June 2025'
    },
    {
        image:blog5,
        title:'Top 10 Free Bootstrap Templates for Your Next Project',
        date:'31st Aug 2025'
    },
]

export const blogTag = [
    'Job','Web Design','Development','Figma','Photoshop','HTML'
]

export const blogSocial = [
    "bi bi-facebook","bi bi-twitter","bi bi-instagram","bi bi-pinterest","bi bi-linkedin"
]

export const helpData = [
    {
        icon:'bi bi-people-fill',
        title:'Community',
        desc:`Think of a news blog that's filled with content hourly on the day of going live.`,
        tag:['Share','Network','Discussion']
    },
    {
        icon:'bi bi-file-earmark-text-fill',
        title:'Order',
        desc:`Think of a news blog that's filled with content hourly on the day of going live.`,
        tag:['Tracking','Delivery','Management']
    },
    {
        icon:'bi bi-coin',
        title:'Refund Policy',
        desc:`Think of a news blog that's filled with content hourly on the day of going live.`,
        tag:['Methods','Process']
    },
    {
        icon:'bi bi-person-check',
        title:'Account Issues',
        desc:`Think of a news blog that's filled with content hourly on the day of going live.`,
        tag:['Profile','Settings','Password']
    },
    {
        icon:'bi bi-bar-chart',
        title:'Business Helps',
        desc:`Think of a news blog that's filled with content hourly on the day of going live.`,
        tag:['Share','Network','Discussion']
    },
    {
        icon:'bi bi-credit-card-2-back',
        title:'Payment',
        desc:`Think of a news blog that's filled with content hourly on the day of going live.`,
        tag:['Methods','VAT','Security']
    },
    {
        icon:'bi bi-camera-reels',
        title:'Guides',
        desc:`Think of a news blog that's filled with content hourly on the day of going live.`,
        tag:['Tutorials','Blogs','Newsletters']
    },
    {
        icon:'bi bi-patch-question',
        title:`FAQ's`,
        desc:`Think of a news blog that's filled with content hourly on the day of going live.`,
        tag:['Help','Articles']
    },
]

export const helpArticles = [
    {
        title:'What are Favorites?',
        desc:`"Favorites" is a feature that allows you to save your treasured items on Envato Market. So if you see something you like, but you’re not ready to u...`
    },
    {
        title:'How Do I Add Or Change My Billing Details?',
        desc:`"Favorites" is a feature that allows you to save your treasured items on Envato Market. So if you see something you like, but you’re not ready to u...`
    },
    {
        title:'How do I change my username?',
        desc:`"Favorites" is a feature that allows you to save your treasured items on Envato Market. So if you see something you like, but you’re not ready to u...`
    },
    {
        title:'How do I change my email address?',
        desc:`"Favorites" is a feature that allows you to save your treasured items on Envato Market. So if you see something you like, but you’re not ready to u...`
    },
    {
        title:`I'm not receiving the verification email`,
        desc:`"Favorites" is a feature that allows you to save your treasured items on Envato Market. So if you see something you like, but you’re not ready to u...`
    },
    {
        title:'How do I change my password?',
        desc:`"Favorites" is a feature that allows you to save your treasured items on Envato Market. So if you see something you like, but you’re not ready to u...`
    },
]

export const singleHelpData = [ 
    {
        id:'item-1',
        title:'How Do I Add Or Change My Billing Details?',
        text1:`In a professional context it often happens that private or corporate clients corder a publication to be made and presented with the actual content still not being ready. Think of a news blog that's filled with content hourly on the day of going live. However, reviewers tend to be distracted by comprehensible content, say, a random text copied from a newspaper or the internet.`,
        text2:`Consider this: You made all the required mock ups for commissioned layout, got all the approvals, built a tested code base or had them built, you decided on a content management system, got a license for it or adapted open source software for your client's needs. Then the question arises: where's the content? Not there yet? That's not so bad, there's dummy copy to the rescue.`,
        text3:`On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided.`,
        badge:true,
    },
    {
        id:'item-2',
        title:'How do I purchase an item?',
        text1:`In a professional context it often happens that private or corporate clients corder a publication to be made and presented with the actual content still not being ready. Think of a news blog that's filled with content hourly on the day of going live. However, reviewers tend to be distracted by comprehensible content, say, a random text copied from a newspaper or the internet.`,
        text2:`Consider this: You made all the required mock ups for commissioned layout, got all the approvals, built a tested code base or had them built, you decided on a content management system, got a license for it or adapted open source software for your client's needs. Then the question arises: where's the content? Not there yet? That's not so bad, there's dummy copy to the rescue.`,
        text3:`On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided.`,
        badge:false,
    },
    {
        id:'item-3',
        title:'How do refunds work?',
        text1:`In a professional context it often happens that private or corporate clients corder a publication to be made and presented with the actual content still not being ready. Think of a news blog that's filled with content hourly on the day of going live. However, reviewers tend to be distracted by comprehensible content, say, a random text copied from a newspaper or the internet.`,
        text2:`Consider this: You made all the required mock ups for commissioned layout, got all the approvals, built a tested code base or had them built, you decided on a content management system, got a license for it or adapted open source software for your client's needs. Then the question arises: where's the content? Not there yet? That's not so bad, there's dummy copy to the rescue.`,
        text3:`On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided.`,
        badge:false,
    },
    {
        id:'item-4',
        title:`I'm trying to find a specific item`,
        text1:`In a professional context it often happens that private or corporate clients corder a publication to be made and presented with the actual content still not being ready. Think of a news blog that's filled with content hourly on the day of going live. However, reviewers tend to be distracted by comprehensible content, say, a random text copied from a newspaper or the internet.`,
        text2:`Consider this: You made all the required mock ups for commissioned layout, got all the approvals, built a tested code base or had them built, you decided on a content management system, got a license for it or adapted open source software for your client's needs. Then the question arises: where's the content? Not there yet? That's not so bad, there's dummy copy to the rescue.`,
        text3:`On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided.`,
        badge:false,
    },
    {
        id:'item-5',
        title:'Envato and the Envato Market sites',
        text1:`In a professional context it often happens that private or corporate clients corder a publication to be made and presented with the actual content still not being ready. Think of a news blog that's filled with content hourly on the day of going live. However, reviewers tend to be distracted by comprehensible content, say, a random text copied from a newspaper or the internet.`,
        text2:`Consider this: You made all the required mock ups for commissioned layout, got all the approvals, built a tested code base or had them built, you decided on a content management system, got a license for it or adapted open source software for your client's needs. Then the question arises: where's the content? Not there yet? That's not so bad, there's dummy copy to the rescue.`,
        text3:`On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided.`,
        badge:false,
    },
    {
        id:'item-6',
        title:'Purchasing Items As A Member',
        text1:`In a professional context it often happens that private or corporate clients corder a publication to be made and presented with the actual content still not being ready. Think of a news blog that's filled with content hourly on the day of going live. However, reviewers tend to be distracted by comprehensible content, say, a random text copied from a newspaper or the internet.`,
        text2:`Consider this: You made all the required mock ups for commissioned layout, got all the approvals, built a tested code base or had them built, you decided on a content management system, got a license for it or adapted open source software for your client's needs. Then the question arises: where's the content? Not there yet? That's not so bad, there's dummy copy to the rescue.`,
        text3:`On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided.`,
        badge:false,
    },
    {
        id:'item-7',
        title:'Buyers Guide to YouTube Content ID & ...',
        text1:`In a professional context it often happens that private or corporate clients corder a publication to be made and presented with the actual content still not being ready. Think of a news blog that's filled with content hourly on the day of going live. However, reviewers tend to be distracted by comprehensible content, say, a random text copied from a newspaper or the internet.`,
        text2:`Consider this: You made all the required mock ups for commissioned layout, got all the approvals, built a tested code base or had them built, you decided on a content management system, got a license for it or adapted open source software for your client's needs. Then the question arises: where's the content? Not there yet? That's not so bad, there's dummy copy to the rescue.`,
        text3:`On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which is the same as saying through shrinking from toil and pain. These cases are perfectly simple and easy to distinguish. In a free hour, when our power of choice is untrammelled and when nothing prevents our being able to do what we like best, every pleasure is to be welcomed and every pain avoided.`,
        badge:false,
    },
]