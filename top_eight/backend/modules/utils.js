exports.getExpiration = () => Math.floor(new Date().getTime() / 1000) + 60;

exports.assertEnvVar = name => {
    if(!(name in process.env)) {
        console.log('You must specify env var',name);
        process.exit();
    }
};
