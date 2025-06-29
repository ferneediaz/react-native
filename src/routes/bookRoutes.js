import express from "express";
import Book from "../models/Book.js";
import cloudinary from "./lib/cloudinary.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
  try {
    //get user from req.user
    const { title, caption, image, rating } = req.body;
    if (!title || !caption || !image || !rating) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ message: "Rating must be between 1 and 5" });
    }
    const uploadResponse = await cloudinary.uploader.upload(image);
    const imageUrl = uploadResponse.secure_url;
    //save to DB
    const newBook = new Book({
      title,
      caption,
      image: imageUrl,
      rating,
      user: req.user._id,
    });
    await newBook.save();
    res.status(201).json({ book: newBook });
  } catch (error) {
    console.log("error in create book", error);
    res.status(500).json({ message: error.message });
  }
});
//pagination => infinite scroll

router.get("/", protectRoute, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const totalBooks = await Book.countDocuments();
    const books = await Book.find()
      .sort({ createdAt: -1 }) //descending order
      .skip(skip)
      .limit(limit)
      .populate("user", "username profileImage");

    res.send({
      books,
      currentPage: page,
      totalBooks: totalBooks,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.log("error in get all books", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// get recommended books by the logged in user
router.get("/user", protectRoute, async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ books });
  } catch (error) {
    console.log("error in get recommended books", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// delete a book
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (book.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    //delete image from cloudinary
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const imageId = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(imageId);
      } catch (deleteError) {
        console.log("error in delete image from cloudinary", deleteError);
      }
    }
    await book.deleteOne();
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    console.log("error in delete book", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//

export default router;
