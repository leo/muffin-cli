<p align="center">
  <a href="http://muffin.cafe">
    <img src="http://i.imgur.com/buhMCWz.png" width="170">
  </a>
</p>

# CLI

This neat command line utility handles all of the hard tasks in your workflow when creating a new site using [muffin](http://muffin.cafe). It's not just much faster than regular task managers, but also handles many other important things that speed up development (like importing data, livereloading and such).

## Usage

If you want to build a new site using muffin, follow [these steps](http://muffin.cafe/guide/get-started).

## Contribute

1. Please make sure that your npm permissions are [fixed](https://docs.npmjs.com/getting-started/fixing-npm-permissions)
2. If you've already installed CLI before, uninstall it: `npm uninstall -g muffin-cli`
3. [Fork](https://guides.github.com/activities/forking/) this repository to your own GitHub account and then [clone](https://guides.github.com/activities/forking/#clone) it to your local device
4. Move into the repo's directory: `cd cli`
5. Generate the binaries: `npm link`
6. Transpile source code and watch for changes: `gulp`

You're can now use the `muffin` command everywhere! :loudspeaker: :sheep:
