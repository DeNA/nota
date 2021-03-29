const bcrypt = require("bcryptjs");
const crypto = require("crypto");

async function passwordHash(password) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const passwordHash = await bcrypt.hash(password, salt);

  return passwordHash;
}

async function verifyPassword(password, hash) {
  const isValid = await bcrypt.compare(password, hash);
  return isValid;
}

async function generateToken() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(24, (err, buffer) => {
      if (err) {
        return reject(err);
      }

      resolve(buffer.toString("hex"));
    });
  });
}

const getDataFromRelayState = function(req) {
  const relayState = req.query.RelayState || req.body.RelayState;
  const [authenticator, redirect] = relayState.split("@@");

  return [authenticator, redirect];
};

module.exports = {
  passwordHash,
  verifyPassword,
  generateToken,
  getDataFromRelayState
};
