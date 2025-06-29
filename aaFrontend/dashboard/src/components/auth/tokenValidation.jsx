import Cookies from "js-cookie";
import { logoutFunc } from "./logout";

export async function getValidAccessToken() {
  const access = Cookies.get("accessToken");
  const refresh = Cookies.get("refreshToken");


  const res = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (res.ok) {
    const data = await res.json();
    Cookies.set("accessToken", data.access);
    return data.access;
  } else {
    logoutFunc()
  }
}