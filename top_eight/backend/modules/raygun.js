const raygun = require('raygun');

const RAYGUN_API_KEY = process.env.RAYGUN_API_KEY;

const raygunClient = new raygun.Client().init({apiKey: RAYGUN_API_KEY});
raygunClient.setTags(['top-8']);

// kind of a hack but raygun doesnt update their docs and app.use(raygunClient.expressHandler) not working
// github issues about it not working at https://github.com/MindscapeHQ/raygun4node
if (process.env.NODE_ENV !== 'development') {
    process.on('uncaughtException', function(err) {
        console.error('module uncaughtException', err);
        raygunClient.send(err);

        // wait before we exit the process with a failure code to allow enough time for raygun to be sent
        setTimeout(function() {
            process.exit(1);
        }, 5000).unref();
    });

    process.on('unhandledRejection', function(err, promise){
        console.error(`Possibly Unhandled Rejection at: Promise ${promise}\n Reason: ${err}`);
        raygunClient.send(err);
    });
}

exports.client = raygunClient;
