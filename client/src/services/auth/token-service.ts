export const getTokenFromSession = async (): Promise<{
  access_token: string;
} | null> => {
  const response = await fetch(
    `${process.env.SERVER_USER_URL}/auth/session/token`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  try {
    return await response.json();
  } catch (error) {
    console.error("JSON parsing error:", error);
    return null;
  }
};

export const getToken = async (): Promise<string | null> => {
  const response = await getTokenFromSession();

  if (response?.access_token) {
    if (response.access_token === "no_token") return null;
    return response.access_token;
  }

  return null;
};
