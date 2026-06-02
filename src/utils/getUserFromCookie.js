import axios from "axios";

export const getUserFromCookie = async () => {
  try {
    const response = await axios.get(
      "https://nepcart-backend.onrender.com/api/decode/cookie", // switched to GET
      { withCredentials: true } // include cookies in request
    );

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("User not authenticated");
    }
  } catch (error) {
    console.error("getUserFromCookie error:", error);
    return null;
  }
};
