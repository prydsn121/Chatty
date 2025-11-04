export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connect failed:", err);
    // Don't crash — retry in prod
    if (process.env.NODE_ENV !== "production") process.exit(1);
  }
};