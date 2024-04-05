import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },

    time: {
      checkInTime: String,
      checkOutTime: String,
    },

    refundable: {
      available: { type: Boolean, default: false },
      refundableUntilDate: String,
      refundableUntilTime: String,
    },

    features: {
      internet: Boolean,
      breakFast: Boolean,
    },

    parking: {
      available: Boolean,
      rule: String,
    },

    meals: [
      {
        name: { type: String, enum: ["Breakfast", "Dinner"] },
        available: Boolean,
        buffet: Boolean,
        inRoom: Boolean,
        inPrivateSpace: Boolean,
      },
    ],

    
    data: {
      type: Map,
      String: [
        { type: String, default: "0" },
        { type: Boolean, default: false },
        { type: Number, default: 0 },
      ],
      default: {},
    },
  },
  {
    timestamps: true,
    collection: "Package",
  }
);

export default mongoose.model("Package", packageSchema);

//  type: Map, // year
//       of: {
//         type: Map, //month
//         of: {
//           type: Map, //day
//           of: {
//             _id: String,
//             price: Number,
//             availability: Boolean,
//             inventory: Number,
//           },
//         },
//       },
