# Self-signed certs for testing

Self-signed certs have to be installed into the OSX keychain.

A script `generate_local_ssh.sh` will generate and install into the keychain.

## To generate and install automatically

```
./generate_local_ssh.sh <FILENAME>

# Where <FILENAME> is a name without an extension such as "testing".
It will want your sudo password to install into the keychain.
```

## Manual override

In case the script above doesn't work.

```
openssl genrsa -out testing.enc.key 2048
openssl req -new -key testing.enc.key -out testing.csr
	# Enter:
	# Country Name: US
	# State: TX
	# Locality: Austin
	# Organiation name: Twitch Test
	# Organizatinal unit name: .
	# Common name: localhost.twitch.tv
	# Email: .
	# A challenge password: .
	# An optional company name: .

openssl rsa -in testing.enc.key -out testing.key
openssl x509 -req -days 365 -in testing.csr -signkey testing.key -out testing.crt
rm testing.enc.key testing.csr
```

### Add to keychain on OSX

* Load Keychain Access program
* Click on "System" on left side
* From main menu bar select "File -- Import items..."
* Navigate to and select the .crt you made above
* Enter system password

A localhost.twitch.tv cert should now show up.

* Double click on the localhost.twitch.tv cert
* Click on the "trust" expansion
* "When using this certificate", change to "Always trust"
* Close the localhost.twitch.tv window
* Enter your system password again
* A blue "+" will appear next to the localhost.twitch.tv icon
* Quit Keychain access

### Use the cert in a server

Use the cert in some server. For example, here's sample code in
node/express:

```
const fs = require('fs');
const https = require('https');
const app = express();
app.get('/', (req,res)=>{
	res.send('testing');
});
var options = {
   key  : fs.readFileSync('testing.key'),
   cert : fs.readFileSync('testing.crt')
};
const PORT = 8002;
https.createServer(options, app).listen(PORT);
```

# Load in Chrome

* Point browser to the server you created.
* The page should load with a green lock on the https.
* If it doesn't work, try shutting down Chrome and restarting it.
