export const checkAutoLogout = (dispatch, logout) => {
  const loginTime = localStorage.getItem('loginTime');
 
  if (!loginTime) return;

  const TEN_MINUTES = 8 * 60 * 60 * 1000; 
  const currentTime = Date.now();

  if (currentTime - loginTime >= TEN_MINUTES) {
    dispatch(logout());
  }
};
