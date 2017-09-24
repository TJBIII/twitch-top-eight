<style src="../../../assets/css/viewer.css"></style>

<template>
    <div id="app">
        <section class="spinner-container" v-if="loading">
            <simple-spinner></simple-spinner>
        </section>

        <div v-if="!top && !loading" class="center">
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

        <div v-if="top && !loading">
            <div class="content">
                <div class="header">
                    <h3>{{ headerText }}</h3>
                </div>
            </div>
            <member :member="member" v-for="(member, index) in top" :key="member.position"></member>
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
            loading: true,
            headerText: `Top 8 Friends`
        }),
        created() {
            this.authHandler = new AuthHandler(this.init, () => {});

            window.Twitch.ext.onAuthorized(data => {
                this.authHandler.handleAuth(data);
            });

            window.Twitch.ext.listen('broadcast', (topic, contentType, message) => {
                const data = JSON.parse(message);

                const evt = data.evt,
                    top = data.top;

                console.log('top', top);
                console.log('evt', evt);

                switch (evt) {
                    case 'updateTop':
                        this.setTop(top);
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
                this.getTop(authData).then(topData => {
                    let top = topData.data;

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
                this.headerText = `Top ${top && top.length ? (top.length > 1 ? top.length + ' Friends' : 'Friend'): '8'} `;
            }
        }
    }
</script>