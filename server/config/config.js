const config = {
  DEFAULT_RATE: 0,
  DEFAULT_AVAILABILITY: false,
  DEFAULT_INVENTORY: 0,
  DEFAULT_PACKAGE_DETAILS: {
    NAME: "BP - Basic Plan",
    DESCRIPTION: "This is basic rate plan for the room",
    INTERNET_AVAILABLE: false,
    PARKING_AVAILABLE: false,
    REFUNDABLE_AVAILABLE: false,
  },
  FETCH_OPTIONS: {
    headers: {
      "Content-Type": "application/xml",
    },
  },
  GOLBAL_ERROR_MESSAGE: "500: SERVER ERROR",
  MONGO: "mongodb+srv://talhaarshad2413:NmthDucLiNDfVYrn@collaboradocs.fuasesu.mongodb.net/",
  CLIENT: "https://hotel-pearl-three.vercel.app",
  COMEON: "FIX UP",
  TOKEN: "lupwt97flnbr5wbg65p",
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60,
};

export default config;