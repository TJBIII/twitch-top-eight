<style src="../../../assets/css/viewer.css"></style>

<template>
    <div id="app">
        <section class="spinner-container" v-if="loading">
            <simple-spinner></simple-spinner>
        </section>

        <div v-if="!eight && !loading" class="center">
            <div class="panel-info">
                <h2>Top 8</h2>
            </div>

            <div class="panel-body">
                <p>Powered By</p>
                <img src="assets/img/logo_med.png" alt="">
                <div>
                    <p v-if="loading">Loading...</p>
                    <p v-else>No Top 8 set yet by this channel.</p>
                </div>
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
            top: null,
            loading: true
        }),
        created() {
            this.authHandler = new AuthHandler(this.init, () => {});

            window.Twitch.ext.onAuthorized(data => {
                this.authHandler.handleAuth(data);
            });

            window.Twitch.ext.listen('broadcast', (topic, contentType, message) => {
                const data = JSON.parse(message),
                    evt = data.evt;

                switch (evt) {
                    case 'update':
                        this.update(data.top);
                        break;
                }
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
                this.getTop(authData).then(top => {
                    this.setTop(top);

                    this.loading = false;
                }).catch(err => {
                    this.loading = false;
                });
            },
            getTop(auth) {
                let channelID = auth.channelId;
                let qs = channelID ? {channelID} : null;

                return http.get('top', {qs, auth});
            },
            setTop(top) {
                if (!top) return;

                this.top = top;
            }
        }
    }
</script>