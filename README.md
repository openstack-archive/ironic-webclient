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


## Development Server

  1. Check out the code.
  2. Run `npm install`
    1. Realize that you don't have node installed. Install node, and npm.
    2. If using a Debian/Ubuntu system, also install node.js and nodejs-legacy.
    3. Then try again.
  3. Run `npm start`


## Other options

    // Will resolve all the runtime dependencies. Remember to commit them.
    npm run update_dependencies
    
    // Will package the site.
    npm pack
    
    // Will spin up a local server and host the raw, unpackaged application.
    npm start
