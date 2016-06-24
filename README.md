# ironic-webclient

A webclient for OpenStack Ironic.


## Important Things

It is imperative that the design and infrastructure of this project makes it
easy to package for various linux distributions. As such, the following
decisions have been made:


##### The project must be fully functional directly from source. 

  * ECMAScript 5 only, no transpiled languages such as TypeScript or
    CoffeeScript.
  * All javascript libraries used at runtime (in the browser) must be committed
    to source.

Note that we do not guarantee performance if running in this mode. Certain
things, such as in-browser CSS compilation will severely degrade the
performance of this application.


##### The project must be easy to develop on.

  * We use common javascript tooling to assist in development (npm, gulp,
    eslint, bower, etc).
  * These tools are supportive, but not required, as such they are considered to
    be environmental, and thus not committed to source.


##### The project must be compatible with the OpenStack License.

  * All runtime dependencies and development tools must use licenses compatible
    with the Apache2.0 license.


## Installation

You will need Node.JS and NPM installed on the target system. For Fedora and/or
CentOS systemd you can install these as follows:

```
$ yum install -y nodejs npm  #dnf on Fedora
```

and on Debian/Ubuntu with:

```
$ apt-get install nodejs nodejs-legacy npm
```

To install the webclient you have to check out the code and install the
dependencies. This can be done as follows:

```
$ git clone https://github.com/openstack/ironic-webclient.git
$ cd ironic-webclient
$ npm install
```


### Enable CORS

To be able to access the Ironic API, you have to enable CORS. A description for
this can be found in the chapter [Cross-origin resource sharing](http://docs.openstack.org/admin-guide/cross_project_cors.html)
of the OpenStack Administrator's Guide.


### Hosting

After installing the dependencies and enabling CORS, you have two options of
running the web application; using the development server or hosted using
a webserver.


#### Development Server

The webclient offers a built-in webserver option for development purpose. It is
not recommended to use this in production use. You can start this server with:

```
$ npm start
```

Which will start the server on [localhost, port 8000](http://localhost:8000).

If you want to run on a different port or IP, you can specify this from the
command line as follows:

```
IP=0.0.0.0 PORT=8080 npm start
```


#### Webserver

For production use, it is recommended to use a webserver. After running

```
$ npm pack
```

you will have a package which will contain all assets needed for hosting the
application.


## Other options

  * Resolve all the runtime dependencies. Remember to commit them

```
npm run update_dependencies
```

  * Package the site.

```
npm pack
```
