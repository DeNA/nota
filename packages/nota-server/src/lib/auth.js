const passport = require("passport");
const { User } = require("../models");
const authUtils = require("./authUtils");
const config = require("../config");

function init(app) {
  app.use(passport.initialize());
  const LocalStrategy = require("passport-local").Strategy;
  const CookieStrategy = require("passport-cookie").Strategy;

  // Only support one for now
  if (
    config.authenticators.ssoAuthenticators &&
    config.authenticators.ssoAuthenticators.length
  ) {
    const SamlStrategy = require("passport-saml").Strategy;

    const samlAuthenticator = config.authenticators.ssoAuthenticators[0];
    const samlOptions = config.authenticatorsConfig[samlAuthenticator.id];

    const samlStrategy = new SamlStrategy(
      {
        ...samlOptions,
        passReqToCallback: true
      },
      async function(req, profile, next) {
        try {
          let user = await User.findByUsername(profile.nameID);

          if (!user) {
            user = await User.create({
              username: profile.nameID,
              email: profile.email,
              authenticator: samlAuthenticator.id
            });
          }

          if (user.authenticator !== samlAuthenticator.id) {
            next(new Error("Invalid authenticator"));
            return;
          }

          next(null, user);
        } catch (err) {
          next(err);
        }
      }
    );

    passport.use(samlStrategy);
  }

  const localStrategy = new LocalStrategy(
    {
      session: false,
      passReqToCallback: true
    },
    async (req, username, password, next) => {
      try {
        const user = await User.findByUsername(username);

        if (!user) {
          return next(null, false);
        }

        const isAuthenticatorValid = req.body.authenticator === "local";
        const isPasswordValid = await authUtils.verifyPassword(
          password,
          user.password
        );

        if (!isPasswordValid || !isAuthenticatorValid) {
          return next(null, false);
        }

        next(null, user);
      } catch (err) {
        next(err);
      }
    }
  );

  const bearerStrategy = new CookieStrategy(async (token, next) => {
    try {
      const user = await User.findByActiveToken(token);

      if (!user) {
        return next(null, false);
      }

      next(null, user);
    } catch (err) {
      next(err);
    }
  });

  passport.use(localStrategy);
  passport.use(bearerStrategy);
}

const local = passport.authenticate("local", { session: false });
const token = passport.authenticate("cookie", { session: false });
const saml = passport.authenticate("saml", {
  session: false,
  failureRedirect: "/",
  failureFlash: true
});

function group(group) {
  return function(req, res, next) {
    if (!req.user.groups.some(userGroup => userGroup.name === group)) {
      return res.sendStatus(401);
    }

    next();
  };
}

module.exports = {
  init,
  saml,
  local,
  token,
  group,
  ADMIN: "admin"
};
