<style>
    .member {
        text-align: center;
        width: 45%;
        padding: 0 2.5%;
        padding-bottom: 20px;
        display: inline-block;
    }

    .member img {
        max-width: 80%;
        margin-top: 10px;
    }
</style>

<template>
    <div class="member">
        <a :href="'https://twitch.tv/' + member.display_name">
            <div class="member_name">{{ member.display_name }}</div>
            <img v-if="member.logo" v-bind:src="member.logo">
            <img v-if="!member.logo" src="assets/img/glitch_purple.png">
        </a>
    </div>
</template>

<script>
    export default {
        props: ['member']
    }
</script>