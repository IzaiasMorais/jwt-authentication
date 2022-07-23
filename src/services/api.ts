import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { signOut } from "../contexts/AuthContext";
import { AuthTokenError } from "./errors/AuthTokenError";

let isRefreshing = false;
// @ts-ignore
let failedRequestQueue = [];

export function setupAPIClient(ctx = undefined) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    baseURL: "http://localhost:3333/",
    headers: {
      Authorization: `Baerer ${cookies["nextauth.token"]}`,
    },
  });

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      if (error.response!.status === 401) {
        // @ts-ignore
        if (error.response.data?.code === "token.expired") {
          // define the new value for let cookies using parseCookies
          cookies = parseCookies(ctx);

          // taking refresh token from inside of the cookies
          const { "nextauth.refreshToken": refreshToken } = cookies;
          const originalConfig = error.config;

          if (!isRefreshing) {
            isRefreshing = true;

            api
              .post("/refresh", {
                refreshToken,
              })
              .then((response) => {
                const { token } = response.data;

                setCookie(ctx, "nextauth.token", token, {
                  maxAge: 60 * 60 * 24 * 30, // 24 hours
                  path: "/",
                });

                setCookie(
                  ctx,
                  "nextauth.refreshToken",
                  response.data.refreshToken,
                  {
                    maxAge: 60 * 60 * 24 * 30, // 24 hours
                    path: "/",
                  }
                );

                // @ts-ignore
                api.defaults.headers["Authorization"] = `Bearer ${token}`;

                // @ts-ignore
                failedRequestQueue.forEach((request) =>
                  request.onSucess(token)
                );
                failedRequestQueue = [];
              })
              .catch((err) => {
                // @ts-ignore
                failedRequestQueue.forEach((request) => request.onSucess(err));
                failedRequestQueue = [];

                if (typeof window) {
                  signOut();
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }

          return new Promise((resolve, reject) => {
            failedRequestQueue.push({
              onSucess: (token: string) => {
                // @ts-ignore
                originalConfig.headers["Authorization"] = `Bearer ${token}`;

                resolve(api(originalConfig));
              },
              onFailure: (err: AxiosError) => {
                reject(err);
              },
            });
          });
        } else {
          if (typeof window) {
            signOut();
          } else {
            return Promise.reject(new AuthTokenError());
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
}
