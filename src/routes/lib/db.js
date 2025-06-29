import mongoose from "mongoose";
import "dotenv/config";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`Connected to MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1); //exit with failure
  }
};
