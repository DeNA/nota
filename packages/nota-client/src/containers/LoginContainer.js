import React, { useEffect, useState } from "react";
import Login from "../components/Login";
import { fetchAuthenticators } from "../lib/api";
import { login } from "../lib/auth";
import logo from "../logo@2x.png";

function LoginContainer({ redirect }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [authenticators, setAuthenticators] = useState(null);
  useEffect(() => {
    // check login sso

    // load authenticators
    const loadAuthenticators = async function() {
      const authenticators = await fetchAuthenticators();
      setAuthenticators(authenticators);
    };
    loadAuthenticators();
  }, []);

  const handleLogin = async user => {
    setLoading(true);
    setError(false);

    const loggedIn = await login(user, redirect);

    if (!loggedIn) {
      setError(true);
      setLoading(false);
    }
  };
  const getRedirectPath = function(search = "") {
    const match = search.match("[?&]from=([^&]+)");

    return match ? match[1] : null;
  };
  const handleSSOLogin = authenticatorId => {
    const authenticator = authenticators.ssoAuthenticators.find(
      authenticator => authenticator.id === authenticatorId
    );

    const redirect = getRedirectPath(window.location.search) || "";

    window.location.href = `${authenticator.endpoint}?RelayState=@@${redirect}`;
  };

  if (authenticators === null) return null;

  return (
    <Login
      authenticators={authenticators.authenticators}
      ssoAuthenticators={authenticators.ssoAuthenticators}
      onLogin={handleLogin}
      onSsoLogin={handleSSOLogin}
      loading={loading}
      error={error}
      title={
        <>
          <img
            src={logo}
            alt="Nota"
            title="Nota"
            width="30"
            height="30"
            className="mr-2"
          />
          {"Nota - Sign in"}
        </>
      }
    />
  );
}

export default LoginContainer;
