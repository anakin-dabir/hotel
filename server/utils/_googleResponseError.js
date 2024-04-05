import config from "../config/config.js";
export default function _googleResponseError(_response, array) {
  let _error = false;
  let _status = 200;
  let _message = "200 - Query Success";
  if (array) {
    for (let i = 0; i < _response.length; ++i) {
      if (_response[i].data.includes("<Errors>")) {
        _error = true;
        _status = 500;
        _message = config.GOLBAL_ERROR_MESSAGE;
        break;
      }
    }
  } else {
    if (_response.data.includes("<Errors>")) {
      _error = true;
      _status = 500;
      _message = config.GOLBAL_ERROR_MESSAGE;
    }
  }

  return { ERROR: _error, STATUS: _status, MESSAGE: _message };
}
