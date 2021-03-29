import React, { useEffect, useState } from "react";
import { Alert, Button, Card, Form, InputGroup } from "react-bootstrap";
import Icon from "./Icon";
import "./Login.css";

function Login({
  authenticators,
  ssoAuthenticators,
  onLogin,
  onSsoLogin,
  loading,
  error,
  title
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedAuthenticator, setSelectedAuthenticator] = useState("");
  useEffect(() => {
    setSelectedAuthenticator(authenticators.length && authenticators[0].id);
  }, [authenticators]);
  const hasSsoAuthenticators = !!ssoAuthenticators.length;
  const [showLocal, setShowLocal] = useState(!hasSsoAuthenticators);

  const handleChangeUsername = evt => setUsername(evt.target.value);
  const handleChangePassword = evt => setPassword(evt.target.value);
  const handleChangeAuthenticator = evt =>
    setSelectedAuthenticator(evt.target.value);
  const handleLogin = evt => {
    evt.preventDefault();

    setPassword("");
    onLogin({ username, password, authenticator: selectedAuthenticator });
  };
  const handleSSOLogin = evt => {
    evt.preventDefault();

    onSsoLogin(evt.target.id);
  };
  return (
    <div className="content-login bg-secondary">
      <Card className="login bg-dark text-light">
        <Card.Header>{title || "Sign in"}</Card.Header>
        <Card.Body style={{ backgroundColor: "rgba(255,255,255,0.7)" }}>
          <div className="sso-signin">
            {ssoAuthenticators.map(authenticator => {
              return (
                <Button
                  id={authenticator.id}
                  key={authenticator.id}
                  block
                  variant="success"
                  disabled={loading}
                  size="lg"
                  onClick={handleSSOLogin}
                >
                  {`Sign in with ${authenticator.label}`}
                </Button>
              );
            })}
          </div>

          <Form className="local-signin" onSubmit={handleLogin}>
            {hasSsoAuthenticators && (
              <div
                onClick={() => setShowLocal(!showLocal)}
                className="local-signin-toggle"
              >
                <Icon name={showLocal ? "caret-bottom" : "caret-right"} />
                {" Other Accounts"}
              </div>
            )}
            {showLocal && (
              <>
                {error && (
                  <Alert variant="warning">Invalid Username or Password</Alert>
                )}
                <InputGroup size="sm">
                  <InputGroup.Prepend>
                    <InputGroup.Text>
                      <Icon name="cloud" />
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    as="select"
                    name="authenticator"
                    value={selectedAuthenticator}
                    autoComplete="off"
                    onChange={handleChangeAuthenticator}
                    disabled={loading}
                  >
                    {authenticators.map(authenticator => (
                      <option key={authenticator.id} value={authenticator.id}>
                        {authenticator.label}
                      </option>
                    ))}
                  </Form.Control>
                </InputGroup>
                <InputGroup size="sm">
                  <InputGroup.Prepend>
                    <InputGroup.Text>
                      <Icon name="person" />
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    type="text"
                    name="username"
                    id="username"
                    placeholder="Username"
                    value={username}
                    onChange={handleChangeUsername}
                    disabled={loading}
                  />
                </InputGroup>
                <InputGroup size="sm">
                  <InputGroup.Prepend>
                    <InputGroup.Text>
                      <Icon name="key" />
                    </InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={handleChangePassword}
                    disabled={loading}
                  />
                </InputGroup>
                <Button
                  type="submit"
                  id="signin-button"
                  block
                  variant="primary"
                  disabled={loading}
                  size="sm"
                >
                  Sign in
                </Button>
              </>
            )}
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Login;
