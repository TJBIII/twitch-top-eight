<style src="../../../assets/css/config.css"></style>

<template>
    <div class="container">
        <h1 class="config-title">Set Top 8</h1>
        <p>Drag to sort!</p>

        <div v-cloak>
            <section class="spinner-container" v-if="loadingTop">
                <simple-spinner></simple-spinner>
            </section>

            <div v-if="!loadingTop">
                <span v-sortable="{onUpdate: onUpdate}">
                    <div class="member" v-for="(member, index) in top" :key="member.position">
                        <div class="member_name">{{ member.display_name }} ({{member.position}}) <span v-on:click="removeMember(index)">X</span></div>
                        <img v-if="member.logo" v-bind:src="member.logo">
                        <img v-if="!member.logo" src="assets/img/glitch_purple.png">
                    </div>
                </span>

                <div v-if="top && top.length < 8" class="add">
                    <input placeholder="Add by username..." v-model="newMemberUsernameText" v-on:keyup.enter="addMember" type="text">
                    <img v-on:click="addMember" src="assets/img/add.png">
                </div>

                <div v-if="top" class="save-button">
                    <button class="btn" :disabled="savingTop" v-on:click="save">{{ saveButtonText }}</button>
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
            top: [],
            loadingTop: true,
            savingTop: false,
            saveButtonText: 'Save Top 8',
            newMemberUsernameText: null
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
                if (!top) return;

                this.top = top.sort((a, b) => a.position - b.position);
            },
            onUpdate({oldIndex, newIndex}) {
                console.log('sortable update', event);
                const movedItem = this.top.splice(oldIndex, 1)[0]
                this.top.splice(newIndex, 0, movedItem)
            },
            save() {
                this.savingTop = true;
                this.saveButtonText = 'Saving...';
                let top = this.top.map((member, idx) => {
                    member.position = idx + 1;
                    return member;
                });

                let auth = {
                    token: this.authHandler.getAuthToken()
                };

                let body = {
                    top,
                    channelID: this.authHandler.getChannelID()
                };

                http.post('saveTop', {body, auth}).then(saveResponse => {
                    this.saveButtonText = 'Saved';
                    this.savingTop = false;
                    console.log('successfully saved');
                    this.top = saveResponse.data.savedTop;
                }).catch(err => {
                    console.log('err', err);
                });
            },
            addMember() {
                if (!this.newMemberUsernameText) return;

                let newMember = {
                    display_name: this.newMemberUsernameText,
                    position: this.top.length + 1
                }

                this.top.push(newMember);
                this.newMemberUsernameText = null;
            },
            removeMember(index) {
                this.top.splice(index, 1);
            }
        }
    }
</script>