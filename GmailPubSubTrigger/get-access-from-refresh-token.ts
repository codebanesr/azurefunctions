const axios = require("axios");

interface RefreshTokenParams {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}

export async function getAccessTokenFromRefreshToken(
  params: RefreshTokenParams
): Promise<string> {
  try {
    const { refreshToken, clientId, clientSecret } = params;

    const response = await axios.post(
      "https://www.googleapis.com/oauth2/v4/token",
      null,
      {
        params: {
          refresh_token: refreshToken,
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "refresh_token",
        },
      }
    );

    // Extract the access token
    const accessToken = response.data.access_token;
    return accessToken;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}
