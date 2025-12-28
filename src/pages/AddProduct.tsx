import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Camera,
  Edit3,
  Package,
  Calendar,
  Tag,
  Image as ImageIcon,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProductStore } from '@/store/useProductStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { api } from '@/lib/mongodb';

const AddProduct = () => {
  const navigate = useNavigate();
  const { addProduct } = useProductStore();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [productData, setProductData] = useState({
    name: '',
    category: 'food',
    expiryDate: '',
    description: '',
    imageUrl: '',
    nutrients: null as any,
    brand: '',
    barcode: '',
    ingredients: ''
  });
  const [activeTab, setActiveTab] = useState('upload');

  const barcodeRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const manualBarcodeRef = useRef<HTMLInputElement>(null);
  const manualExpiryRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      setSelectedFile(files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    if (!productData.barcode) {
      toast.error('Barcode is required! Please enter it first.');
      barcodeRef.current?.focus();
      return;
    }

    if (!productData.expiryDate) {
      toast.error('Expiry Date is required! Please enter it manually.');
      expiryRef.current?.focus();
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      if (productData.barcode) {
        formData.append('manualBarcode', productData.barcode);
      }

      const response = await api.post('/upload/combined', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const result = response.data;

      if (result.success && result.productDetails) {
        setProductData({
          name: result.productDetails.name,
          category: result.productDetails.category,
          expiryDate: productData.expiryDate, // KEEP the manual expiry date
          description: result.productDetails.description || `${result.productDetails.brand} - Auto-detected`,
          imageUrl: result.imageUrl || result.productDetails.imageUrl,
          nutrients: result.productDetails.nutrients,
          brand: result.productDetails.brand || '',
          barcode: result.barcode || productData.barcode,
          ingredients: result.productDetails.ingredients || ''
        });
        toast.success(result.ocrData?.barcode ? 'Barcode detected from image!' : 'Product details found!');
        // Switch to manual tab to review and save
        setTimeout(() => setActiveTab('manual'), 1000);
      } else if (result.success && !result.productDetails && result.imageUrl) {
        // Only image uploaded but no barcode found
        setProductData(prev => ({
          ...prev,
          imageUrl: result.imageUrl,
          expiryDate: result.ocrData?.expiryDate || prev.expiryDate
        }));
        if (result.ocrData?.expiryDate) {
          toast.success('Expiry date detected from image!');
        }
        toast.info('No barcode found in image. Please enter it manually or check the photo.');
      }
    } catch (error) {
      console.error('Lookup failed:', error);
      toast.error('Failed to process image. Please try again or enter details manually.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      await addProduct({
        name: productData.name,
        category: productData.category as 'food' | 'medicine' | 'cosmetic' | 'other',
        expiryDate: productData.expiryDate,
        imageUrl: productData.imageUrl,
        nutrients: productData.nutrients,
        brand: productData.brand,
        barcode: productData.barcode,
        ingredients: productData.ingredients,
        status: 'active'
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product. Please try again.');
    }
  };

  const categories = [
    { value: 'food', label: 'Food & Beverages', icon: '🍎', color: 'from-green-500 to-emerald-500' },
    { value: 'medicine', label: 'Medicine & Health', icon: '💊', color: 'from-red-500 to-pink-500' },
    { value: 'cosmetic', label: 'Beauty & Cosmetics', icon: '🧴', color: 'from-purple-500 to-pink-500' },
    { value: 'other', label: 'Other Products', icon: '📦', color: 'from-blue-500 to-cyan-500' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Add New <span className="gradient-text">Product</span>
            </h1>
            <p className="text-muted-foreground">
              Track your products and never let them expire again
            </p>
          </div>

          <div className="glass-card p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8 glass-card p-1">
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </TabsTrigger>
                <TabsTrigger value="scan" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Scan Barcode
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex items-center gap-2">
                  <Edit3 className="h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-6">
                {/* Barcode Input Section */}
                <div className="glass-card p-6 space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    Enter Barcode
                  </h3>
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm font-medium">Barcode (Required)</Label>
                    <Input
                      ref={barcodeRef}
                      placeholder="Enter barcode..."
                      value={productData.barcode || ''}
                      onChange={(e) => setProductData(prev => ({ ...prev, barcode: e.target.value }))}
                      className="w-full"
                      required
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Label className="text-sm font-medium">Expiry Date (Required)</Label>
                    <Input
                      type="date"
                      ref={expiryRef}
                      value={productData.expiryDate}
                      onChange={(e) => setProductData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full"
                      required
                    />
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className={cn(
                    'border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 relative overflow-hidden group',
                    dragOver
                      ? 'border-primary bg-primary/10 shadow-glow-primary'
                      : 'border-border-glass/50 hover:border-primary/50 hover:bg-primary/5'
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="scan-effect absolute inset-0 opacity-0 group-hover:opacity-100" />

                  <input
                    type="file"
                    id="file-upload"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />

                  {selectedFile ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-4"
                    >
                      <CheckCircle className="h-16 w-16 text-success mx-auto" />
                      <div>
                        <p className="text-lg font-semibold text-success">Image Ready!</p>
                        <p className="text-muted-foreground">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Now enter barcode above and click Lookup button
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto group-hover:text-primary transition-colors duration-300" />
                        <div className="absolute inset-0 h-16 w-16 bg-primary/20 blur-xl mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold mb-2">
                          Drop your product image here
                        </p>
                        <p className="text-muted-foreground mb-4">
                          or click to browse from your device
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Sparkles className="h-4 w-4" />
                          Upload photo + enter barcode above, then click Lookup
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Lookup Button */}
                {selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <Button
                      onClick={() => uploadImage(selectedFile)}
                      variant="neon"
                      size="lg"
                      disabled={uploading}
                      className="group"
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform" />
                          Lookup Product Details
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      Combines barcode + photo for complete auto-fill
                    </p>
                  </motion.div>
                )}

                {/* Product Details Display */}
                {productData.name && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="glass-card p-6 space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Detected Product Information</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Product Image */}
                      {productData.imageUrl && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Product Image</Label>
                          <img
                            src={productData.imageUrl}
                            alt={productData.name}
                            className="w-full h-48 object-cover rounded-lg border border-border-glass/50"
                          />
                        </div>
                      )}

                      {/* Product Details */}
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Product Name</Label>
                          <p className="text-lg font-semibold">{productData.name}</p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                          <p className="capitalize">{productData.category}</p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Expiry Date</Label>
                          <p className="font-medium">{productData.expiryDate}</p>
                        </div>

                        {productData.description && (
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                            <p className="text-sm">{productData.description}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Nutrients */}
                    {productData.nutrients && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">Nutritional Information</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(productData.nutrients).filter(([_, value]) => value).map(([key, value]) => (
                            <div key={key} className="bg-background-glass/50 p-3 rounded-lg text-center">
                              <div className="text-xs text-muted-foreground capitalize">{key}</div>
                              <div className="font-semibold text-sm">{String(value)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="glass"
                        onClick={() => {
                          setProductData({
                            name: '',
                            category: 'food',
                            expiryDate: '',
                            description: '',
                            imageUrl: '',
                            nutrients: null,
                            brand: '',
                            barcode: '',
                            ingredients: ''
                          });
                          setSelectedFile(null);
                        }}
                        className="flex-1"
                      >
                        Scan Another
                      </Button>
                      <Button
                        variant="neon"
                        onClick={handleSubmit}
                        className="flex-1 group"
                      >
                        <Package className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        Add to Dashboard
                      </Button>
                    </div>
                  </motion.div>
                )}
              </TabsContent>

              <TabsContent value="scan" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Manual Barcode Input */}
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Tag className="h-5 w-5 text-primary" />
                      Enter Barcode Manually
                    </h3>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Enter barcode number (e.g., 123456789012)"
                        value={productData.barcode || ''}
                        onChange={(e) => setProductData(prev => ({ ...prev, barcode: e.target.value }))}
                        className="flex-1"
                      />
                      <Button
                        onClick={async () => {
                          if (productData.barcode) {
                            setUploading(true);
                            try {
                              const response = await api.post('/upload/barcode', {
                                barcode: productData.barcode
                              });
                              const result = response.data;
                              if (result.productDetails) {
                                setProductData({
                                  ...productData,
                                  name: result.productDetails.name,
                                  category: result.productDetails.category,
                                  expiryDate: result.productDetails.expiryDate,
                                  description: `${result.productDetails.brand} - Auto-detected from barcode`,
                                  nutrients: result.productDetails.nutrients,
                                  brand: result.productDetails.brand || '',
                                  barcode: result.barcode || '',
                                  ingredients: result.productDetails.ingredients || ''
                                });
                                toast.success('Product details found!');
                                // Switch to manual tab to review and save
                                setTimeout(() => setActiveTab('manual'), 1000);
                              } else {
                                toast.error('Product not found in database.');
                              }
                            } catch (error) {
                              console.error('Barcode lookup failed:', error);
                              toast.error('Connection failed. Please ensure the backend server is running on port 3001.');
                            } finally {
                              setUploading(false);
                            }
                          }
                        }}
                        variant="neon"
                        disabled={!productData.barcode || uploading}
                      >
                        {uploading ? 'Looking up...' : 'Lookup'}
                      </Button>
                    </div>
                  </div>

                  {/* Camera Scanner */}
                  <div className="glass-card p-12 text-center">
                    <Camera className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Camera Barcode Scanner</h3>
                    <p className="text-muted-foreground mb-6">
                      Point your camera at the barcode to automatically detect product information
                    </p>
                    <Button variant="glass" size="lg" className="group">
                      <Camera className="h-5 w-5 group-hover:scale-110 transition-transform" />
                      Start Camera (Coming Soon)
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4">
                      For now, use manual barcode entry above or upload product image
                    </p>
                  </div>
                </motion.div>
              </TabsContent>

              <TabsContent value="manual" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Barcode Field (Mandatory) */}
                    <div className="space-y-2">
                      <Label htmlFor="barcode" className="text-base font-semibold flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        Barcode Number (Required)
                      </Label>
                      <Input
                        id="barcode"
                        ref={manualBarcodeRef}
                        placeholder="Enter 8-14 digit barcode..."
                        value={productData.barcode || ''}
                        onChange={(e) => setProductData(prev => ({ ...prev, barcode: e.target.value }))}
                        className="glass-card border-border-glass/50 focus:border-primary/50 text-lg"
                        required
                      />
                    </div>

                    {/* Product Name */}
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base font-semibold">
                        Product Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter product name..."
                        value={productData.name}
                        onChange={(e) => setProductData(prev => ({ ...prev, name: e.target.value }))}
                        className="glass-card border-border-glass/50 focus:border-primary/50"
                        required
                      />
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Category</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map((category) => (
                          <motion.div
                            key={category.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={cn(
                              'p-4 rounded-xl border cursor-pointer transition-all duration-300 group',
                              productData.category === category.value
                                ? 'border-primary bg-primary/10 shadow-glow-primary'
                                : 'border-border-glass/50 hover:border-primary/50 glass-card'
                            )}
                            onClick={() => setProductData(prev => ({ ...prev, category: category.value }))}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                'w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-gradient-to-r',
                                category.color
                              )}>
                                {category.icon}
                              </div>
                              <div>
                                <div className="font-medium">{category.label}</div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Expiry Date */}
                    <div className="space-y-2">
                      <Label htmlFor="expiry" className="text-base font-semibold">
                        Expiry Date
                      </Label>
                      <Input
                        id="expiry"
                        ref={manualExpiryRef}
                        type="date"
                        value={productData.expiryDate}
                        onChange={(e) => setProductData(prev => ({ ...prev, expiryDate: e.target.value }))}
                        className="glass-card border-border-glass/50 focus:border-primary/50"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-base font-semibold">
                        Description (Optional)
                      </Label>
                      <textarea
                        id="description"
                        placeholder="Add any additional notes..."
                        value={productData.description}
                        onChange={(e) => setProductData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-3 rounded-xl glass-card border border-border-glass/50 focus:border-primary/50 bg-transparent resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    {/* Nutrients (Auto-detected) */}
                    {productData.nutrients && (
                      <div className="space-y-3">
                        <Label className="text-base font-semibold flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Nutritional Information (Auto-detected)
                        </Label>
                        <div className="glass-card p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                          {Object.entries(productData.nutrients).filter(([_, value]) => value).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <div className="text-sm text-muted-foreground capitalize">{key}</div>
                              <div className="font-semibold">{String(value)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <Button
                        type="button"
                        variant="glass"
                        size="lg"
                        onClick={() => navigate('/dashboard')}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="neon"
                        size="lg"
                        className="flex-1 group"
                      >
                        <Package className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        Add Product
                      </Button>
                    </div>
                  </form>
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddProduct;