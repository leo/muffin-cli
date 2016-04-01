# Contribute

Muffin currently consists of two parts: The [Ember app](https://github.com/muffin-cms/client) that runs in the user's browser and the [CLI](https://github.com/muffin-cms/app) (also called "core" or "main package") that supplies the data and processes your website's contents.

The following guideline will show you how to set up both on your local machine to be able to start contributing code. But before you do anything, please make sure that your npm permissions are [fixed](https://docs.npmjs.com/getting-started/fixing-npm-permissions).

If you just want to fix a misspelling or something equally small, simply click "Edit" (the small pencil) on the affected file and GitHub will automatically prepare a working copy for you. But if you'd like to add a new feature or make changes to the code, read along:

## Requirements

You'll need the latest version of those things to be able to contribute something to muffin. So please make sure they're updated before trying something out:

- [Bower](http://bower.io/#install-bower)
- [Ember CLI](http://ember-cli.com)
- [PhantomJS](https://www.npmjs.com/package/phantomjs-prebuilt)

## Setup

1. [Fork](https://guides.github.com/activities/forking/) the parts of the system to your GitHub account.
2. [Clone](https://guides.github.com/activities/forking/#clone) both repos to your local machine. While doing so, make sure that they're both on the same folder level.
3. Move into the directory that contains the CLI: `cd app`
4. Link it to your global module directory: `npm link`
5. Move into the "client" repository: `cd client`
6. Install all missing dependencies: `npm intall`
7. After everything has been installed, run `npm start` within the same directory to tell Ember CLI to watch for file changes and rebuilt the app if necessary.

That's all! :loudspeaker: :turtle:

## Get started

Now that all the parts of the system are on your local machine, you can easily create new example sites by using the following command:

```bash
muffin new <site-name>
```

Please note that if you don't specify `<site-name>`, the blueprints will simply be placed in the current directory.

You'll then be asked to enter a few details about your site and the database connection. After you've answered all questions, your new site will be prepared. As soon as the setup is finished, link your local version of muffin to the dependencies:

```bash
npm link muffin
```

And bang! :boom: You're now able to run the site based on your local development fork of muffin.

But first, please make sure that your DB is running:

```
mongod
```

After that, start the server:

```bash
npm start
```
