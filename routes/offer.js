const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const isAuthentificated = require("../middlewares/isAuthentificated");
const convertToBase64 = require("../outils/convertB64");
const cloudinary = require("cloudinary").v2;

const Offer = require("../models/Offer");

router.post(
  "/offer/publish",
  isAuthentificated,
  fileUpload(),
  async (req, res) => {
    try {
      const { price, title, description, brand, size, condition, color, city } =
        req.body;
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          { MARQUE: brand },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],

        owner: req.user,
      });
      console.log(newOffer);
      if (req.files) {
        const imageToUpload = convertToBase64(req.files.image);
        // console.log(imageToUpload);
        const uploadResult = await cloudinary.uploader.upload(imageToUpload, {
          folder: `/correction/vinted`,
        });

        // console.log(uploadResult);
        newOffer.product_image = uploadResult;
      }

      await newOffer.save();
      return res.status(201).json(newOffer);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const limit = 5;
    const { title, priceMin, priceMax, sort, page } = req.query;
    const filters = {};
    if (title) {
      filters.product_name = new RegExp(title, "i");
    }
    if (priceMax) {
      filters.product_price = { $lte: priceMax };
    }
    if (priceMin) {
      if (priceMax) {
        filters.product_price.$gte = priceMin;
      } else {
        filters.product_price = { $gte: priceMin };
      }
    }
    const sortObject = {};
    if (sort === "price_desc") {
      sortObject.product_price = "desc";
    }
    if (sort === "price_asc") {
      sortObject.product_price = "asc";
    }
    currentPage = page;

    // console.log(filters);
    const offers = await Offer.find(filters)
      .sort(sortObject)
      .limit(limit)
      .skip((page - 1) * limit)

      .populate({
        path: "owner",
        select: "account -_id",
      })
      .select("-_v");

    const count = await Offer.countDocuments(filters);
    console.log(count);
    // console.log(offers);
    return res.status(200).json({ count: count, offers: offers });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

router.get("/offer/:id", async (req, res) => {
  try {
    const result = await Offer.findById(req.query.params).populate({
      path: "owner",
      select: "account",
    });
    if (result) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json("Cette offre n'existe pas (ou plus) !");
    }
  } catch (error) {
    return res.status(400).json();
  }
});

module.exports = router;
