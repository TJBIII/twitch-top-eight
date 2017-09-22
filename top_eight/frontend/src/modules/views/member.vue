<style>
    .member {
        text-align: center;
        width: 20%;
        margin: 0 1.25%;
        float: left;
    }

    .member img {
        max-width: 80%;
        margin-top: 10px;
    }

    .member_name {

    }
</style>

<template>
    <div class="member">
        <a href="">
            <div class="member_name">{{ member.display_name }} ({{member.position}})</div>
            <img v-if="member.logo" v-bind:src="member.logo">
            <img v-if="!member.logo" src="assets/img/glitch.png">
        </a>
    </div>
</template>

<script>
    export default {
        props: ['member']
    }
</script>