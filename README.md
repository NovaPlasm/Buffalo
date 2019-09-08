# Buffalo
Streamline deployments to your workspace

## GitHub setup
To set up Buffalo, you should first create a GitHub webhook for each of your repositories.  These can be found in Repo Settings -> Webhooks.

When creating your webhook, set the payload URL to the url of your Buffalo instance followed by `/postreceive`.  For example, if you have Buffalo configured to run on buffalo.example.com, I would set the payload URL as `http://buffalo.example.com/postreceive`.

Generate a random secret -- this will be the same amoung all GitHub webhooks you setup with Buffalo.

Select `Just the push event.` when asked which events trigger the webhook, and click `Add webhook`.  You may get a 404 error -- that's fine, once the Buffalo server is running it will go away.

### Setting up your config.json

In order for Buffalo to run, you need to setup the `config.json` file.  An example is shown below -- make sure to replace the `githubSecret` with the one you used above.

``` JSON
{
    "port": 8888,
    "githubSecret": "################################",
    "services": {
        "RepoName1": {
            "location": "/path/to/app/folder",
            "onUpdate": "sudo yarn install && sudo yarn run deploy"
        },
        "RepoName2": {
            "location": "/path/to/app/folder",
            "onUpdate": "sudo yarn install && sudo npm run build && sudo serve -s build"
        }
    }
}
```
`port` is the port that Buffalo will run on.
`onUpdate` is the command that will execute once your app has been updated.  Typically you want to include `yarn install` in case package dependencies have changed, and some sort of `deploy` script to re-start your app.

Make sure that the name of your services are the same name as on github.  For example, if I were to set up Buffalo to work with Buffalo, I would have the following:

``` JSON
{
    "port": 8888,
    "githubSecret": "################################",
    "services": {
        "Buffalo": {
            "location": "/path/to/buffalo/",
            "onUpdate": "sudo yarn install && sudo yarn run deploy"
        },
        "SomeOtherRepo": {
            "location": "/path/to/app/folder/",
            "onUpdate": "sudo yarn install && sudo npm run build && sudo serve -s build"
        }
    }
}
```

Note the use of `Buffalo`, not `NovaPlasm/Buffalo`.

### Running Buffalo

Now that you have Buffalo successfully setup, we want to make sure all dependencies are installed.  Depending on what package manager you use, run either
`yarn`
or
`npm install`.

To run your Buffalo instance, use `yarn run start` or `node app`.  If you use PM2, and want to use the deploy script I included, for your first-time setup run
`pm2 start -f ./server.sh --name buffalo`.

Then, whenever you need to update, you just need to use `sudo yarn install && sudo yarn run deploy`

## Slack integration
Buffalo can be integrated with slack using two quick steps.

1. Add the `slackHook` property to the JSON file with a link to the slack app that will be running Buffalo
``` JSON
{
    "port": 8888,
    "githubSecret": "################################",
    "slackHook": "https://hooks.slack.com/services/<>",
    "services": {
        "RepoName1": {
            "location": "/path/to/app/folder/",
            "onUpdate": "sudo yarn install && sudo yarn run deploy"
        },
        "RepoName2": {
            "location": "/path/to/app/folder/",
            "onUpdate": "sudo yarn install && sudo npm run build && sudo serve -s build"
        }
    }
}
```

2. Add some or all of the following slash commands.  I'm assuming that your buffalo server is running on buffalo.example.com:
    * Command `binfo`.  Request URL: `http://buffalo.example.com/info`.  Usage hint: `[project]`.
        * Command would be structured as `/binfo RepoName`.
        * This command gives known info on the status of the repo.

    * Command `blist`.  Request URL: `http://buffalo.example.com/list`.  No usage hint.  Command would be structured as `/blist`.
        * Command would be structured as `/blist`.
        * This command gives a JSON list of all repos currently in your Buffalo instance.

    * Command `bfetch`.  Request URL: `http://buffalo.example.com/fetch`.  Usage hint: `[project]`.  Command would be structured as `/bfetch Buffalo`.
        * Command would be structured as `/bfetch RepoName`.
        * This command has Buffalo forcefully check and update your app in case the github webhook failed.