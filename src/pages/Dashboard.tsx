import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ProductCard from '@/components/ProductCard';
import AuthModal from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProductStore } from '@/store/useProductStore';
import { mockProducts } from '@/lib/mockData';
import { 
  Search, 
  Filter, 
  Plus, 
  BarChart3, 
  AlertTriangle,
  Clock,
  CheckCircle,
  TrendingUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const navigate = useNavigate();
  const { products, user, fetchProducts, removeProduct, loading } = useProductStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'soon-expiring' | 'expired'>('all');
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user, fetchProducts]);

  // Use real products if user is authenticated, otherwise show auth prompt
  const displayProducts = user ? products : [];

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <div className="container mx-auto px-4 pt-20 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="glass-card p-12 max-w-md mx-auto">
              <div className="text-6xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold mb-2">Sign in required</h3>
              <p className="text-muted-foreground mb-6">
                Please sign in to access your dashboard and manage your products.
              </p>
              <Button 
                variant="neon" 
                onClick={() => setShowAuthModal(true)}
                className="gap-2"
              >
                Sign In to Continue
              </Button>
            </div>
          </motion.div>
        </div>
        
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  const filteredProducts = displayProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || product.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: displayProducts.length,
    active: displayProducts.filter(p => p.status === 'active').length,
    soonExpiring: displayProducts.filter(p => p.status === 'soon-expiring').length,
    expired: displayProducts.filter(p => p.status === 'expired').length,
  };

  const filters = [
    { key: 'all', label: 'All Items', count: stats.total, icon: BarChart3 },
    { key: 'active', label: 'Active', count: stats.active, icon: CheckCircle },
    { key: 'soon-expiring', label: 'Expiring Soon', count: stats.soonExpiring, icon: Clock },
    { key: 'expired', label: 'Expired', count: stats.expired, icon: AlertTriangle },
  ] as const;

  const handleDonate = (product: any) => {
    console.log('Donating product:', product);
    navigate('/donations');
  };

  const handleDelete = async (id: string) => {
    try {
      await removeProduct(id);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Your <span className="gradient-text">Dashboard</span>
              </h1>
              <p className="text-muted-foreground">
                Track and manage your products efficiently
              </p>
            </div>
            
            <Button 
              variant="neon" 
              size="lg"
              onClick={() => navigate('/add')}
              className="group"
            >
              <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
              Add Product
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {filters.map((filter, index) => {
              const Icon = filter.icon;
              return (
                <motion.div
                  key={filter.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="glass-card p-4 hover:shadow-glow-primary transition-all duration-300 group cursor-pointer"
                  onClick={() => setActiveFilter(filter.key)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={cn(
                      'h-5 w-5 transition-colors duration-300',
                      activeFilter === filter.key ? 'text-primary' : 'text-muted-foreground'
                    )} />
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-2xl font-bold mb-1">{filter.count}</div>
                  <div className="text-xs text-muted-foreground">{filter.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-card border-border-glass/50 focus:border-primary/50"
              />
            </div>
            <Button variant="glass" size="lg">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter.key}
                variant={activeFilter === filter.key ? 'neon' : 'ghost'}
                size="sm"
                onClick={() => setActiveFilter(filter.key)}
                className={cn(
                  'transition-all duration-300',
                  activeFilter === filter.key && 'shadow-glow-primary'
                )}
              >
                {filter.label} ({filter.count})
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {filteredProducts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onDelete={handleDelete}
                  onDonate={handleDonate}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16"
            >
              <div className="glass-card p-12 max-w-md mx-auto">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || activeFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Start by adding your first product'
                  }
                </p>
                <Button 
                  variant="neon" 
                  onClick={() => navigate('/add')}
                >
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;