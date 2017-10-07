<style src="../../../assets/css/config.css"></style>

<template>
    <div class="container">
        <div v-cloak class="top-container">
            <section class="spinner-container" v-if="loadingTop">
                <simple-spinner></simple-spinner>
            </section>

            <div v-if="!loadingTop">
                <p class="instructions">Add up to 8  friends below! Click and drag on a user's image to sort, and then click the save button at the bottom to lock in your changes.</p>

                <span v-sortable="{onUpdate: onUpdate}">
                    <div class="member" v-for="(member, index) in top" :key="member.position">
                        <div class="member_name">{{`${index + 1 }.`}} {{ member.display_name }}</div>
                        <img v-if="member.logo" v-bind:src="member.logo">
                        <img v-if="!member.logo" src="assets/img/glitch.png">
                        <div><a target="_blank" :href="'https://twitch.tv/' + member.display_name"><button class="btn btn-view">View</button></a></div>
                        <div><button class="btn btn-remove" v-on:click="removeMember(index)">Remove</button></div>
                    </div>
                </span>

                <div v-if="top && top.length < 8" class="add">
                    <input placeholder="Add by username..." v-model="newMemberUsernameText" v-on:keyup.enter="addMember" type="text">
                    <img src="assets/img/glitch.png">
                    <div><button class="btn btn-add" v-on:click="addMember">Add</button></div>
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
                if (!top) return;

                this.top = top.sort((a, b) => a.position - b.position);
            },
            onUpdate({oldIndex, newIndex}) {
                const movedItem = this.top.splice(oldIndex, 1)[0]
                this.top.splice(newIndex, 0, movedItem)
                this.saveButtonText = 'Save';
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
                    this.top = saveResponse.data.savedTop;
                }).catch(err => {
                    console.log('err', err);
                });
            },
            addMember() {
                if (!this.newMemberUsernameText) return;

                let newMember = {
                    display_name: this.newMemberUsernameText,
                    position: this.top.length + 1,
                    logo: 'assets/img/loader.gif'
                }

                this.top.push(newMember);
                this.newMemberUsernameText = null;
                this.save();
            },
            removeMember(index) {
                this.top.splice(index, 1);
                this.saveButtonText = 'Save';
            }
        }
    }
</script>