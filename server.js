var ghost = require('ghost');

// Run a single Ghost process
ghost()
  .then( ghostServer => ghostServer.start() )
  .catch( error => {
    console.error(`Ghost server error: ${error.message} ${error.stack}`);
    process.exit(1);
  });
