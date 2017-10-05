<style src="../../../assets/css/viewer.css"></style>

<template>
    <div id="app">
        <section class="spinner-container" v-if="loading">
            <simple-spinner></simple-spinner>
        </section>

        <div v-if="!allTop && !loading" class="center">
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

        <div v-if="allTop && !loading">
            <div class="content">
                <div class="header">
                    <h3>{{ headerText }}</h3>
                </div>
            </div>

            <member :member="member" v-for="(member, index) in currTop" :key="member.position"></member>

            <div v-if="allTop.length > 4" class="pagination" >
                <button id="prevBtn" v-if="startPos !== 1" v-on:click="prevPage">Prev</button>
                <button id="nextBtn" v-if="startPos + membersPerPage - 1 < allTop.length" v-on:click="nextPage">Next</button>
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
            allTop: [],
            currTop: [], // currently displayed top friends
            startPos: 1,
            membersPerPage: 4,
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
                    allTop = data.top;

                switch (evt) {
                    case 'updateTop':
                        this.setTop(allTop);
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
            setTop(allTop) {
                if (!allTop) return;

                this.allTop = allTop;
                this.headerText = `Top ${allTop && allTop.length ? (allTop.length > 1 ? allTop.length + ' Friends' : 'Friend'): '8'} `;

                this.setVisible();
            },
            setVisible() {
                // set the visible portion of all top friends
                let startIdx = this.startPos - 1;

                this.currTop = this.allTop.slice(startIdx, startIdx + this.membersPerPage);
            },
            nextPage() {
                this.startPos += 4;
                this.setVisible();
            },
            prevPage() {
                this.startPos -= 4;
                this.setVisible();
            }
        }
    }
</script>