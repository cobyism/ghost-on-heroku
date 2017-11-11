# [Ghost](https://github.com/TryGhost/Ghost) on [Heroku](http://heroku.com)

Ghost is a free, open, simple blogging platform. Visit the project's website at <http://ghost.org>, or read the docs on <http://support.ghost.org>.

## Ghost version 1.X

The latest release of Ghost is now supported! Changes include:

  * Requires MySQL database, available through either of two add-ons:
    * [JawsDB](https://elements.heroku.com/addons/jawsdb) (deploy default)
    * [ClearDB](https://elements.heroku.com/addons/cleardb)
  * `HEROKU_URL` config var renamed to `PUBLIC_URL` to avoid using Heroku's namespace

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

### Things you should know

After deployment,
- First, visit Ghost at `https://YOURAPPNAME.herokuapp.com/ghost` to set up your admin account
- The app may take a few minutes to come to life
- Your blog will be publicly accessible at `https://YOURAPPNAME.herokuapp.com`
- If you subsequently set up a [custom domain](https://devcenter.heroku.com/articles/custom-domains) for your blog, you’ll need to update your Ghost blog’s `PUBLIC_URL` environment variable accordingly
- If you create much content or decide to scale-up the dynos to support more traffic, a more substantial, paid database plan will be required.

#### Using with file uploads disabled

Heroku app filesystems [aren’t meant for permanent storage](https://devcenter.heroku.com/articles/dynos#ephemeral-filesystem), so file uploads are disabled by default when using this repository to deploy a Ghost blog to Heroku. If you’re using Ghost on Heroku with S3 file uploads disabled, you should leave all environment variables beginning with `S3_…` blank.

#### Configuring S3 file uploads

To configure S3 file storage, create an S3 bucket on Amazon AWS, and then specify the following details as environment variables on the Heroku deployment page (or add these environment variables to your app after deployment via the Heroku dashboard):

- `S3_ACCESS_KEY_ID` and `S3_ACCESS_SECRET_KEY`: **Required if using S3 uploads**. These fields are the AWS key/secret pair needed to authenticate with Amazon S3. You must have granted this keypair sufficient permissions on the S3 bucket in question in order for S3 uploads to work.

- `S3_BUCKET_NAME`: **Required if using S3 uploads**. This is the name you gave to your S3 bucket.

- `S3_BUCKET_REGION`: **Required if using S3 uploads**. Specify the region the bucket has been created in, using slug format (e.g. `us-east-1`, `eu-west-1`). A full list of S3 regions is [available here](http://docs.aws.amazon.com/general/latest/gr/rande.html#s3_region).

- `S3_ASSET_HOST_URL`: Optional, even if using S3 uploads. Use this variable to specify the S3 bucket URL in virtual host style, path style or using a custom domain. You should also include a trailing slash (example `https://my.custom.domain/`).  See [this page](http://docs.aws.amazon.com/AmazonS3/latest/dev/VirtualHosting.html) for details.

Once your app is up and running with these variables in place, you should be able to upload images via the Ghost interface and they’ll be stored in Amazon S3. :sparkles:

##### Provisioning an S3 bucket using an add-on

If you’d prefer not to configure S3 manually, you can provision the [Bucketeer add-on](https://devcenter.heroku.com/articles/bucketeer)
to get an S3 bucket (Bucketeer starts at $5/mo).

To configure S3 via Bucketeer, leave all the S3 deployment fields blank and deploy your
Ghost blog. Once your blog is deployed, run the following commands from your terminal:

    heroku addons:create bucketeer --app YOURAPPNAME

The environment variables set by the add-on will be automatically detected and used to
configure your Ghost blog and enable uploads.

### How this works

This repository is a [Node.js](https://nodejs.org) web application that specifies [Ghost as a dependency](https://docs.ghost.org/v1.0.0/docs/using-ghost-as-an-npm-module), and makes a deploy button available.

  * Ghost and Casper theme versions are declared in the Node app's [`package.json`](package.json)
  * Scales across processor cores in larger dynos via [Node cluster API](https://nodejs.org/dist/latest-v6.x/docs/api/cluster.html)

## Updating source code

Optionally after deployment, to push Ghost upgrades or work with source code, clone this repo (or a fork) and connect it with the Heroku app:

```bash
git clone https://github.com/cobyism/ghost-on-heroku
cd ghost-on-heroku

heroku git:remote -a YOURAPPNAME
heroku info
```

Then you can push commits to the Heroku app, triggering new deployments:

```bash
git add .
git commit -m "Important changes"
git push heroku master
```

See more about [deploying to Heroku with git](https://devcenter.heroku.com/articles/git).


## Problems?

If you have problems using your instance of Ghost, you should check the [official documentation](http://support.ghost.org/) or open an issue on [the official issue tracker](https://github.com/TryGhost/Ghost/issues). If you discover an issue with the deployment process provided by *this repository*, then [open an issue here](https://github.com/cobyism/ghost-on-heroku).

## License

Released under the [MIT license](./LICENSE), just like the Ghost project itself.
