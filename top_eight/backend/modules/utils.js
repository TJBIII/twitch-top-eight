exports.getExpiration = () => Math.floor(new Date().getTime() / 1000) + 60;

exports.assertEnvVar = name => {
    if(!(name in process.env)) {
        console.log('You must specify env var',name);
        process.exit();
    }
};

exports.compareTopWithTwitch = (topData, twitchUserData) => {
    let confirmedTop = [];

    if (!twitchUserData || !twitchUserData.users) return confirmedTop;

    topData.forEach(member => {
        let confirmedUser = twitchUserData.users.find(twitchUser => {
            return twitchUser.name.toLowerCase() === member.display_name.toLowerCase();
        });

        console.log(`confirmed for ${member.display_name}`, confirmedUser);

        if (confirmedUser) {
            confirmedTop.push({
                position: member.position,
                logo: confirmedUser.logo,
                display_name: confirmedUser.display_name,
                twitchID: confirmedUser._id
            });
        }
    });

    return confirmedTop;
};