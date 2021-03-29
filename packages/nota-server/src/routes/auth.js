const express = require("express");
const auth = require("../lib/auth");
const authUtils = require("../lib/authUtils");
const router = express.Router();
const { UserToken } = require("../models");
const config = require("../config");

router.post("/login", auth.local, async function(req, res, next) {
  try {
    const [token, expire] = await req.user.generateUserToken();
    res.cookie("token", token, { expires: new Date(expire) });
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

router.post("/logout", auth.token, async function(req, res, next) {
  try {
    await UserToken.destroy({
      where: {
        userId: req.user.id
      }
    });

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

router.get("/authenticators", async function(req, res, next) {
  try {
    res.json(config.authenticators);
  } catch (err) {
    next(err);
  }
});

router.get("/saml", auth.saml, async function(req, res, next) {
  res.redirect("/");
});

router.post("/saml", auth.saml, async function(req, res, next) {
  try {
    const [token, expire] = await req.user.generateUserToken();
    const [, redirect] = authUtils.getDataFromRelayState(req);
    res.cookie("token", token, { expires: new Date(expire) });
    res.redirect(redirect || "/");
  } catch (err) {
    next(err);
  }
});

module.exports = router;
