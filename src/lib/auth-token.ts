import Cookies from "js-cookie";

const TOKEN_KEY = "auth_token";

export const tokenService = {
  get() {
    return Cookies.get(TOKEN_KEY);
  },

  set(token: string) {
    Cookies.set(TOKEN_KEY, token, {
      expires: 7,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  },

  remove() {
    Cookies.remove(TOKEN_KEY);
  },

  exists() {
    return !!Cookies.get(TOKEN_KEY);
  },
};
