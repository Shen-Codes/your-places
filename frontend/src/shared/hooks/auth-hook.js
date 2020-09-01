import { useEffect, useState, useCallback } from 'react';

let logoutTimer;

export const useAuth = () => {
   const [token, setToken] = useState(false);
   const [tokenExpDate, setTokenExpDate] = useState();
   const [userId, setUserId] = useState(false);

   const login = useCallback((uid, token, expDate) => {
      setToken(token);
      setUserId(uid);
      const tokenExpDate = expDate || new Date(new Date().getTime() + 7200000);
      setTokenExpDate(tokenExpDate);
      localStorage.setItem(
         'userData',
         JSON.stringify({
            userId: uid,
            token: token,
            tokenExpDate: tokenExpDate.toISOString()
         })
      );
   }, []);

   const logout = useCallback(() => {
      setToken(null);
      setTokenExpDate(null);
      setUserId(null);

      localStorage.removeItem('userData');
   }, []);

   useEffect(() => {
      if (token && tokenExpDate) {
         const remainingTime = tokenExpDate.getTime() - new Date().getTime();
         logoutTimer = setTimeout(logout, remainingTime);
      } else {
         clearTimeout(logoutTimer);
      }
   }, [token, logout, tokenExpDate]);

   useEffect(() => {
      const storedData = JSON.parse(localStorage.getItem('userData'));

      if (
         storedData &&
         storedData.token &&
         new Date(storedData.tokenExpDate) > new Date()
      ) {
         login(
            storedData.userId,
            storedData.token,
            new Date(storedData.tokenExpDate)
         );
      }
   }, [login]);

   return { token, login, logout, userId };
};
