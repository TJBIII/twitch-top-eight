<style src="../../../assets/css/config.css"></style>

<template>
    <div>
        <h3 class="config-title">Pick Top 8</h3>

        <div v-cloak>
            <section class="spinner-container" v-if="loadingTop">
                <simple-spinner></simple-spinner>
            </section>
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
        methods: {
            init(authData) {
                this.getTop(authData).then(top => {
                    if (!top) return;

                    //TODO: set top

                    this.loadingTop = false;
                }).catch(err => {
                    console.log('err', err);
                    return false;
                });
            }
        }
    }
</script>