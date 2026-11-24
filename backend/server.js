const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const brochureRoutes = require("./routes/brochureRoutes");
const chatRoutes = require("./routes/chatRoutes");

dotenv.config();

const app = express();

// 1. Security middleware
app.use(helmet());

// 2. CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

// 3. Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Cookie parser
app.use(cookieParser());

// 5. Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
});

app.use("/api", limiter);
app.use("/api/users", userRoutes);

// 6. Register routes AFTER middleware
app.use("/api/auth", authRoutes);
app.use("/api/brochures", brochureRoutes);
app.use("/api/chat", chatRoutes);

// 7. Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hyundai AI Assistant API is running",
  });
});

// 8. Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
