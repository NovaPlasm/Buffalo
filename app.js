const axios = require('axios');
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: true }));
const exec = require('child_process').exec;
const crypto = require('crypto');
const config = require('./config.json');
const secret = config.githubSecret;

exec('sudo echo "help"');
exec('eval $(ssh-agent -s)');
exec('ssh-add ~/.ssh/id_rsa');

app.post('/postreceive', (req, res) => {
    if (req.headers['x-hub-signature'] === "sha1=" + crypto.createHmac('sha1',
        secret).update(JSON.stringify(req.body)).digest('hex')) {
        const type = req.headers['x-github-event'];
        if (type === 'push') {
            console.log("Secrets match!");
            if (config.services[req.body.repository.name]) {
                var conf = config.services[req.body.repository.name];
                console.log('Sender');
                console.log(req.body.sender.login);
                console.log('Pusher');
                console.log(req.body.pusher.name,req.body.pusher.email);
                console.log('Repo');
                console.log(req.body.repository.full_name, req.body.repository.name);
                console.log("Secrets match!");
                exec('cd ' + conf.location + ' && echo \'Pulling...\' && git pull origin master');
                if (!conf.usePostReceive) {
                    exec(conf.onUpdate);
                }
            }
        } else if (type === 'pull_request') {
            console.log("###########");
            console.log("Got a pull request!");
        }
        res.send("Thanks!");
    } else {
        if (config.slackHook) slackUpdate("Got a failed secret match");
        res.send('Secrets don\'t match!');
    }
});

if (config.slackHook) {
    function slackUpdate(message) {
        axios.post(config.slackHook, {
            text: message
        }).catch((error) => {
            console.error(error);
        });
    }

    app.post('/info', (req, res) => {
        console.log(req.body);
        res.send('Thanks');
    });

    app.post('/list', (req, res) => {
        res.send(config);
    });

    app.post('/fetch', (req, res) => {
        res.send(req);
    });
}

app.listen(config.port, () => console.log(`Buffalo listening on port ${config.port}!`))