import jwt from "jsonwebtoken";
import "dotenv/config";
import User from "../models/User.js";

const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers("Authorization".replace("Bearer ", ""));
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //find user by id
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("error in protectRoute", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export default protectRoute;
