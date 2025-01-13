import Cookies from 'js-cookie';

export const logoutFunc = () => {
    if (Cookies.get("accessToken")) {
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      window.location="/"
    }
};