<style>
    .member {
        text-align: center;
        width: 45%;
        padding: 12px 2.5%;
        display: inline-block;
    }

    .member img {
        max-width: 80%;
        margin-top: 10px;
    }

    .member-name {
        font-size: 0.9em;
    }
</style>

<template>
    <div class="member">
        <a :href="'https://twitch.tv/' + member.display_name" target="_blank">
            <div class="member-name">{{ member.position + '.' + ' ' + member.display_name }}</div>
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