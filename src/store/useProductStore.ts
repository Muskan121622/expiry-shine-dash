import { create } from 'zustand';
import { supabase, type Database } from '@/lib/supabase';

export interface Product {
  id: string;
  name: string;
  category: 'food' | 'medicine' | 'cosmetic' | 'other';
  expiryDate: string;
  status: 'active' | 'soon-expiring' | 'expired';
  imageUrl?: string;
  addedDate: string;
  daysUntilExpiry: number;
}

export interface DonationItem {
  id: string;
  product: Product;
  donatedBy: string;
  location: string;
  contactInfo: string;
  isAvailable: boolean;
}

interface ProductStore {
  products: Product[];
  donations: DonationItem[];
  theme: 'dark' | 'light';
  loading: boolean;
  user: any;
  init: () => Promise<void>;
  addProduct: (product: Omit<Product, 'id' | 'addedDate' | 'daysUntilExpiry'>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  addDonation: (donation: Omit<DonationItem, 'id'>) => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchDonations: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  toggleTheme: () => void;
  calculateStatus: (expiryDate: string) => Product['status'];
  calculateDaysUntilExpiry: (expiryDate: string) => number;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  donations: [],
  theme: 'dark',
  loading: false,
  user: null,

  // Initialize auth state
  init: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    set({ user });
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      set({ user: session?.user || null });
    });
  },

  addProduct: async (productData) => {
    const { user } = get();
    if (!user) throw new Error('User must be logged in');

    set({ loading: true });
    
    const daysUntilExpiry = get().calculateDaysUntilExpiry(productData.expiryDate);
    const status = get().calculateStatus(productData.expiryDate);
    
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        category: productData.category,
        expiry_date: productData.expiryDate,
        image_url: productData.imageUrl,
        status,
        days_until_expiry: daysUntilExpiry,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    const product: Product = {
      id: data.id,
      name: data.name,
      category: data.category,
      expiryDate: data.expiry_date,
      status: data.status,
      imageUrl: data.image_url,
      addedDate: data.added_date,
      daysUntilExpiry: data.days_until_expiry,
    };

    set((state) => ({
      products: [...state.products, product],
      loading: false,
    }));
  },

  removeProduct: async (id) => {
    set({ loading: true });
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    set((state) => ({
      products: state.products.filter((p) => p.id !== id),
      loading: false,
    }));
  },

  updateProduct: async (id, updates) => {
    set({ loading: true });
    
    const updateData: any = { ...updates };
    if (updates.expiryDate) {
      updateData.expiry_date = updates.expiryDate;
      updateData.days_until_expiry = get().calculateDaysUntilExpiry(updates.expiryDate);
      updateData.status = get().calculateStatus(updates.expiryDate);
      delete updateData.expiryDate;
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      products: state.products.map((p) =>
        p.id === id
          ? {
              ...p,
              name: data.name,
              category: data.category,
              expiryDate: data.expiry_date,
              status: data.status,
              imageUrl: data.image_url,
              daysUntilExpiry: data.days_until_expiry,
            }
          : p
      ),
      loading: false,
    }));
  },

  addDonation: async (donationData) => {
    set({ loading: true });
    
    const { data, error } = await supabase
      .from('donations')
      .insert({
        product_id: donationData.product.id,
        donated_by: donationData.donatedBy,
        location: donationData.location,
        contact_info: donationData.contactInfo,
        is_available: donationData.isAvailable,
      })
      .select()
      .single();

    if (error) throw error;

    const donation: DonationItem = {
      id: data.id,
      product: donationData.product,
      donatedBy: data.donated_by,
      location: data.location,
      contactInfo: data.contact_info,
      isAvailable: data.is_available,
    };

    set((state) => ({
      donations: [...state.donations, donation],
      loading: false,
    }));
  },

  fetchProducts: async () => {
    const { user } = get();
    if (!user) return;

    set({ loading: true });

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('added_date', { ascending: false });

    if (error) throw error;

    const products: Product[] = data.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      expiryDate: item.expiry_date,
      status: item.status,
      imageUrl: item.image_url,
      addedDate: item.added_date,
      daysUntilExpiry: item.days_until_expiry,
    }));

    set({ products, loading: false });
  },

  fetchDonations: async () => {
    set({ loading: true });

    const { data, error } = await supabase
      .from('donations')
      .select(`
        *,
        products (*)
      `)
      .eq('is_available', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to match DonationItem interface
    // Note: This would need proper join handling in real implementation
    set({ donations: [], loading: false });
  },

  signIn: async (email, password) => {
    set({ loading: true });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    set({ user: data.user, loading: false });
  },

  signUp: async (email, password) => {
    set({ loading: true });
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    set({ user: data.user, loading: false });
  },

  signOut: async () => {
    set({ loading: true });
    
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;

    set({ user: null, products: [], donations: [], loading: false });
  },

  toggleTheme: () => {
    set((state) => ({
      theme: state.theme === 'dark' ? 'light' : 'dark',
    }));
  },

  calculateDaysUntilExpiry: (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  calculateStatus: (expiryDate: string) => {
    const daysUntilExpiry = get().calculateDaysUntilExpiry(expiryDate);
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 7) return 'soon-expiring';
    return 'active';
  },
}));