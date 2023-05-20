import { createCookie } from "@remix-run/node";

export const userInfoCookie = createCookie("user-information", {
  httpOnly: true,
  secure: true,
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 400),
});
