<style src="../../../assets/css/config.css"></style>

<template>
    <div>
        <h3 class="config-title">Set Top 8</h3>

        <div v-cloak>
            <section class="spinner-container" v-if="loadingTop">
                <simple-spinner></simple-spinner>
            </section>

            <div v-if="!loadingTop">
                <member :member="member" v-for="(member, index) in top" :key="member.position"></member> 
            </div>
        </div>
    </div>
</template>

<script>
    const http = require('../http');
    const AuthHandler = require('../auth');

    export default {
        data: () => ({
            authHandler: null,
            top: [],
            loadingTop: true,
            savingTop: false,
            saveButtonText: 'Save Top 8',
        }),
        created() {
            this.authHandler = new AuthHandler(this.init, () => {});

            window.Twitch.ext.onAuthorized(data => {
                this.authHandler.handleAuth(data);
            });

            window.Twitch.ext.onError(err => {
                console.log('Twitch.ext.onError', err);
            });
        },
        components: {
            'member': require('./member.vue')
        },
        methods: {
            init(authData) {
                this.getTop(authData).then(topData => {
                    if (!topData) return;

                    // add the topData data to the page
                    this.setTop(topData.data);

                    this.loadingTop = false;
                }).catch(err => {
                    console.log('err', err);
                    return false;
                });
            },
            getTop(auth) {
                let channelID = auth.channelId;
                let qs = channelID ? {channelID} : null;

                return http.get('top', {qs, auth});
            },
            setTop(top) {
                console.log('setting top with', top);
                this.top = top;
            }
        }
    }
</script>