export const setTokenToStorage = (token: string) => {
  localStorage.setItem("token", token);
};

export const getTokenFromStorage = () => {
  return localStorage.getItem("token");
};
