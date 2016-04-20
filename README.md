<p align="center">
  <a href="http://muffin.cafe">
    <img src="http://i.imgur.com/buhMCWz.png" width="170">
  </a>
</p>

# muffin

**WORK IN PROGRESS**

If you ask an experienced developer what he's thinking about content management systems, he'll probably tell you that he doesn't like them since they're bloated, overkill and slow as fuck. Muffin would like to change that.

Of course it doesn't yet have those cool features which all the other cool kids on the block are showing off, but it's very ambitious and always has an open ear for feedback from all angles!

## Use me

To learn how to create a new site using muffin, take a look at [this](http://muffin.cafe/guide/get-started).

## Contribute

1. Please make sure that your npm permissions are [fixed](https://docs.npmjs.com/getting-started/fixing-npm-permissions)
2. If you've already installed CLI before, uninstall it: `npm uninstall muffin-cli -g`
3. [Fork](https://guides.github.com/activities/forking/) this repository to your own GitHub account and then [clone](https://guides.github.com/activities/forking/#clone) it to your local device
4. Move into the repo's directory: `cd cli`
5. Generate the binaries: `npm link`
6. You're ready! :loudspeaker: :sheep:

Running the 5th step will transpile the source code for the first time and then generate binaries out of it. This basically means that you'll now be able to use the `muffin` command everywhere.

However, to make sure that the binaries get re-created everytime you make changes to the source code, you need to run the `gulp` command (which will watch for changes).
