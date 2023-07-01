const axios = require("axios");

interface RefreshTokenParams {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
}

async function getAccessTokenFromRefreshToken(
  params: RefreshTokenParams
): Promise<string> {
  try {
    const { refreshToken, clientId, clientSecret } = params;

    const response = await axios.post(
      "https://oauth2.googleapis.com/token",
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
