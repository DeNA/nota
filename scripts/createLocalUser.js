const { prompt } = require("enquirer");
const { User } = require("../packages/nota-server/src/models");
const { passwordHash } = require("../packages/nota-server/src/lib/authUtils");

const createUser = async function(username, password, status) {
  await User.create({
    username,
    password,
    email: `${username}@nota`,
    authenticator: "local",
    status
  });
};

const updateUser = async function(user, password, status) {
  await user.update({ password, status }, { fields: ["password", "status"] });
};

const findUser = async function(username) {
  const user = await User.findByUsername(username);

  return user;
};

const main = async function() {
  try {
    const { username, password, type } = await prompt([
      {
        name: "username",
        type: "input",
        message: "Username:",
        validate: (input) =>
          input && input.length ? true : "username is required"
      },
      {
        name: "password",
        type: "password",
        message: "Password:",
        validate: (input) =>
          input && input.length >= 8 ? true : "password minimum length is 8"
      },
      {
        name: "type",
        type: "select",
        message: "Select user type:",
        choices: ["nota_admin", "normal_user"]
      }
    ]);

    const existingUser = await findUser(username);
    const hash = await passwordHash(password);
    const status =
      type === "nota_admin" ? User.STATUS.APP_ADMIN : User.STATUS.ACTIVE;

    if (existingUser) {
      await updateUser(existingUser, hash, status);
      console.log(`Updated existing user: ${username}`);
    } else {
      await createUser(username, hash, status);
      console.log(`Created new user: ${username}`);
    }

    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(-1);
  }
};

main();
