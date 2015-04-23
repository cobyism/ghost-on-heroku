# [Ghost](https://github.com/TryGhost/Ghost) on [Heroku](http://heroku.com)

Ghost is a free, open, simple blogging platform. Visit the project's website at <http://ghost.org>, or read the docs on <http://support.ghost.org>.

## Deploying on Heroku

To get your own Ghost blog running on Heroku, click the button below:

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/cobyism/ghost-on-heroku)

Fill out the form, and you should be cooking with gas in a few seconds.

### Things you should know

- After deployment, visit the admin area at `YOURAPPNAME.herokuapp.com/ghost` to set up your blog.

- Your blog will be publicly accessible at `YOURAPPNAME.herokuapp.com`.

- To make changes to your Ghost blog (like adding a theme to the `/content` directory, for instance), clone your blog locally using the [Heroku Toolbelt](https://toolbelt.heroku.com/):

  ```sh
  heroku git:clone --app YOURAPPNAME
  ```

### What do I put in the fields?

- **App name**. Pick a name for your application. Heroku says this field is optional, but it’s easier if you choose a name here, because you need to specify the URL of your blog in the first config field anyway. You can add a custom domain later if you want, but this is the name of the application you’ll see in your Heroku dashboard.

- **Heroku URL**. Take the name of your Heroku application, and put it into URL form. For example, if you choose `my-ghost-blog` as the app name, the Heroku URL config value needs to be `http://my-ghost-blog.herokuapp.com` (no trailing slash). If you subsequently set up a [custom domain](https://devcenter.heroku.com/articles/custom-domains) for your blog, you’ll need to update your Ghost blog’s `HEROKU_URL` environment variable accordingly.

- **S3 configuration**. All the config fields begining with `S3_…` are completely optional, and leaving them blank is totally fine. See the section below on file uploads for details.

### File uploads

Heroku app filesystems [aren’t meant for permanent storage](https://devcenter.heroku.com/articles/dynos#ephemeral-filesystem), so when it comes to file uploads for a Ghost blog deployed to Heroku, you have two options:

- **Configure S3 file storage.** Create an S3 bucket on Amazon AWS, and then specify your `S3_ACCESS_KEY_ID`, `S3_ACCESS_SECRET_KEY`, and `S3_BUCKET_NAME` as environment variables on Heroku’s deployment page. Once your app is up and running, you’ll be able to upload images via the Ghost UI and they’ll be stored in Amazon S3. :sparkles:

- **Disable file uploads.** Leave all the S3-related environment variable fields blank on Heroku’s deployment page and file uploads will be disabled. Ghost will ask you for external URLs instead of allowing images to be uploaded. If you don’t know what S3 is, this is the option you want.

_**ProTip™**: You can start off with file uploads disabled, and specify all your S3 environment variables at a later stage. You aren’t stuck with the decision you make on the original deploy. :grin:_

### How this works

This repository is essentially a minimal web application that specifies [Ghost as a dependency](https://github.com/TryGhost/Ghost/wiki/Using-Ghost-as-an-NPM-module), and makes a deploy button available.

## Problems?

If you have problems using your instance of Ghost, you should check the [official documentation](http://support.ghost.org/) or open an issue on [the official issue tracker](https://github.com/TryGhost/Ghost/issues). If you discover an issue with the deployment process provided by *this repository*, then [open an issue here](https://github.com/cobyism/ghost-on-heroku).

## License

Released under the [MIT license](./LICENSE), just like the Ghost project itself.
