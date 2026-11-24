const mongoose = require("mongoose");

const brochureSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    storedName: {
      type: String,
      required: true,
      unique: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
      default: "application/pdf",
    },

    fileSize: {
      type: Number,
      required: true,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    vehicleModel: {
      type: String,
      default: null,
    },

    variants: {
      type: [String],
      default: [],
    },

    processingStatus: {
      type: String,
      enum: [
        "uploaded",
        "processing",
        "chunked",
        "indexed",
        "processed",
        "failed",
      ],
      default: "uploaded",
    },

    extractedPages: [
      {
        pageNumber: {
          type: Number,
          required: true,
        },

        text: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// Useful for filtering a user's brochures by vehicle
brochureSchema.index({ uploadedBy: 1, vehicleModel: 1 });

const Brochure = mongoose.model("Brochure", brochureSchema);

module.exports = Brochure;
