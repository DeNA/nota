import history from "./history";

export async function login(login, redirect = "/") {
  try {
    const response = await fetch(`/auth/login`, {
      method: "post",
      body: JSON.stringify(login),
      headers: new Headers({
        "content-type": "application/json"
      })
    });

    if (response.ok) {
      history.push(redirect);
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}

export async function logout() {
  try {
    await fetch(`/auth/logout`, {
      method: "post",
      headers: new Headers({
        "content-type": "application/json"
      })
    });
  } catch (err) {
    return false;
  }
}
