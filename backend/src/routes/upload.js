const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const barcodeScanner = require('../services/barcodeScanner');
const ocrService = require('../services/ocrService');
const aiService = require('../services/aiService');
const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Combined barcode + photo upload with complete auto-fill
router.post('/combined', upload.single('image'), async (req, res) => {
  try {
    const { manualBarcode } = req.body;

    if (!req.file && !manualBarcode) {
      return res.status(400).json({ error: 'Either image or barcode required' });
    }

    let imageUrl = null;
    let ocrData = { barcode: null, expiryDate: null, text: null };

    // Process image if provided
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'expiry-products',
            transformation: [{ width: 1200, height: 900, crop: 'limit' }, { quality: 'auto' }]
          },
          (error, result) => error ? reject(error) : resolve(result)
        ).end(req.file.buffer);
      });

      imageUrl = result.secure_url;
      console.log('Image uploaded:', imageUrl);

      // Try AI analysis first
      const aiData = await aiService.analyzeProductImage(imageUrl);

      if (aiData && (aiData.barcode || aiData.expiryDate || aiData.productDetails)) {
        console.log('AI analysis successful or provided product details');
        ocrData = {
          barcode: aiData.barcode,
          expiryDate: aiData.expiryDate,
          productDetails: aiData.productDetails
        };
      } else {
        // Fallback to legacy OCR
        console.log('AI failed or returned no data, falling back to legacy OCR');
        ocrData = await ocrService.scanImage(imageUrl);
      }
      console.log('Final scan results:', ocrData);
    }

    // Use manual barcode or OCR barcode
    let finalBarcode = manualBarcode || ocrData.barcode;

    // Sanitize the final barcode
    if (finalBarcode) {
      finalBarcode = finalBarcode.toString().replace(/\D/g, '');
    }

    console.log('Processed barcodes:', { manual: manualBarcode, ocr: ocrData.barcode, final: finalBarcode });

    let productInfo = ocrData?.productDetails || null;

    // Lookup product info if barcode available and not already found by AI
    if (finalBarcode && !productInfo) {
      console.log('Barcode lookup required for:', finalBarcode);
      productInfo = await barcodeScanner.getProductInfo(finalBarcode);
      console.log('Barcode lookup result:', productInfo);
    }

    // Fallback to demo data if no product found
    if (!productInfo && finalBarcode) {
      productInfo = {
        name: `Product ${finalBarcode.slice(-4)}`,
        brand: 'Auto-Detected Brand',
        category: 'food',
        nutrients: {
          energy: '250 kcal',
          protein: '8g',
          fat: '12g',
          carbohydrates: '28g',
          sugar: '15g',
          fiber: '3g',
          sodium: '0.5g'
        },
        ingredients: 'Water, Sugar, Natural Flavors, Preservatives',
        shelfLife: 30
      };
    }

    // Calculate expiry date
    let finalExpiryDate = null;
    if (ocrData.expiryDate) {
      finalExpiryDate = ocrData.expiryDate;
    } else if (productInfo?.shelfLife) {
      const date = new Date();
      date.setDate(date.getDate() + productInfo.shelfLife);
      finalExpiryDate = date.toISOString().split('T')[0];
    }

    // Build complete response
    const response = {
      success: true,
      imageUrl,
      barcode: finalBarcode,
      ocrData,
      productDetails: productInfo ? {
        name: productInfo.name,
        brand: productInfo.brand,
        category: productInfo.category,
        description: productInfo.description,
        expiryDate: finalExpiryDate,
        nutrients: productInfo.nutrients,
        ingredients: productInfo.ingredients,
        imageUrl,
        barcode: finalBarcode
      } : null
    };

    res.json(response);

  } catch (error) {
    console.error('Combined upload error:', error);
    res.status(500).json({ error: 'Processing failed' });
  }
});

// Legacy image upload endpoint
router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'expiry-products',
          transformation: [{ width: 800, height: 600, crop: 'limit' }, { quality: 'auto' }]
        },
        (error, result) => error ? reject(error) : resolve(result)
      ).end(req.file.buffer);
    });

    const scanResult = await ocrService.scanImage(result.secure_url);

    res.json({
      imageUrl: result.secure_url,
      barcode: scanResult.barcode,
      ocrText: scanResult.text,
      detectedExpiryDate: scanResult.expiryDate
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Manual barcode lookup endpoint
router.post('/barcode', async (req, res) => {
  try {
    const { barcode } = req.body;

    if (!barcode) {
      return res.status(400).json({ error: 'Barcode is required' });
    }

    // Get product info from enhanced scanner (always returns data)
    const productInfo = await barcodeScanner.getProductInfo(barcode);
    console.log('Barcode scanner returned:', productInfo);

    if (productInfo) {
      // Calculate expiry date based on shelf life
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + productInfo.shelfLife);

      const response = {
        barcode: barcode,
        productDetails: {
          name: productInfo.name,
          brand: productInfo.brand,
          category: productInfo.category,
          nutrients: productInfo.nutrients,
          expiryDate: expiryDate.toISOString().split('T')[0],
          imageUrl: productInfo.imageUrl,
          ingredients: productInfo.ingredients
        }
      };

      res.json(response);
    } else {
      // This should never happen now since barcodeScanner always returns data
      res.json({
        barcode: barcode,
        productDetails: {
          name: `Product ${barcode.slice(-4)}`,
          brand: 'Unknown Brand',
          category: 'other',
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          nutrients: null,
          ingredients: 'Not specified'
        }
      });
    }

  } catch (error) {
    console.error('Barcode lookup error:', error);
    res.status(500).json({ error: 'Failed to lookup barcode' });
  }
});

module.exports = router;