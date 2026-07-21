const localtunnel = require('localtunnel');

(async () => {
  try {
    const tunnel = await localtunnel({ port: 3000 });

    console.log("your url is: " + tunnel.url);

    tunnel.on('close', () => {
      console.log("tunnel closed");
      process.exit(0);
    });

    // Keep the process alive using a persistent timer
    setInterval(() => {}, 60000);
  } catch (err) {
    console.error("Error creating tunnel:", err);
    process.exit(1);
  }
})();
