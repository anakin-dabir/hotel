import config from "../config/config.js";

export default function _googleError(error) {
  if (error?.response?.status === 400 && error?.response?.data) {
    console.log(error.response.data);
    return `${
      error.response.data.split("IP ")[1] || error.response.data.split("IP: ")[1]
    } IP is not allowed from Google`;
  }
  return config.GOLBAL_ERROR_MESSAGE;
}
