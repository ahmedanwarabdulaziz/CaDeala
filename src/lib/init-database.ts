import { FirebaseService } from './firebase-admin';
import { Category, Subcategory, SubSubcategory } from '@/types/admin';

// Sample categories data
const sampleCategories: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Restaurants',
    slug: 'restaurants',
    description: 'Discover amazing dining experiences',
    seoTitle: 'Best Restaurants - Gift Cards & Dining',
    seoDescription: 'Find the perfect restaurant gift cards for food lovers',
    seoKeywords: ['restaurants', 'dining', 'food', 'gift cards', 'fine dining'],
    bannerImage: '',
    roundedImage: '',
    squareImage: '',
    cardImage: '',
    isActive: true,
    isFeatured: true,
    order: 1,
    createdBy: 'admin'
  },
  {
    name: 'Retail',
    slug: 'retail',
    description: 'Shop your favorite stores',
    seoTitle: 'Retail Gift Cards - Shopping & Fashion',
    seoDescription: 'Gift cards for your favorite retail stores and fashion brands',
    seoKeywords: ['retail', 'shopping', 'fashion', 'clothing', 'gift cards'],
    bannerImage: '',
    roundedImage: '',
    squareImage: '',
    cardImage: '',
    isActive: true,
    isFeatured: true,
    order: 2,
    createdBy: 'admin'
  },
  {
    name: 'Services',
    slug: 'services',
    description: 'Professional services and experiences',
    seoTitle: 'Service Gift Cards - Beauty, Spa & More',
    seoDescription: 'Gift cards for beauty, spa, fitness and professional services',
    seoKeywords: ['services', 'beauty', 'spa', 'fitness', 'gift cards'],
    bannerImage: '',
    roundedImage: '',
    squareImage: '',
    cardImage: '',
    isActive: true,
    isFeatured: false,
    order: 3,
    createdBy: 'admin'
  },
  {
    name: 'Entertainment',
    slug: 'entertainment',
    description: 'Fun and entertainment experiences',
    seoTitle: 'Entertainment Gift Cards - Movies & Activities',
    seoDescription: 'Gift cards for movies, games, and entertainment activities',
    seoKeywords: ['entertainment', 'movies', 'games', 'activities', 'gift cards'],
    bannerImage: '',
    roundedImage: '',
    squareImage: '',
    cardImage: '',
    isActive: true,
    isFeatured: false,
    order: 4,
    createdBy: 'admin'
  }
];

// Sample subcategories data
const sampleSubcategories: Omit<Subcategory, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Restaurants subcategories
  {
    categoryId: '', // Will be set dynamically
    name: 'Fast Food',
    slug: 'fast-food',
    description: 'Quick and delicious meals',
    seoTitle: 'Fast Food Gift Cards',
    seoDescription: 'Gift cards for popular fast food restaurants',
    seoKeywords: ['fast food', 'quick meals', 'gift cards'],
    bannerImage: '',
    roundedImage: '',
    squareImage: '',
    cardImage: '',
    isActive: true,
    order: 1,
    createdBy: 'admin'
  },
  {
    categoryId: '', // Will be set dynamically
    name: 'Fine Dining',
    slug: 'fine-dining',
    description: 'Elegant dining experiences',
    seoTitle: 'Fine Dining Gift Cards',
    seoDescription: 'Gift cards for upscale restaurants and fine dining',
    seoKeywords: ['fine dining', 'upscale', 'restaurants', 'gift cards'],
    bannerImage: '',
    roundedImage: '',
    squareImage: '',
    cardImage: '',
    isActive: true,
    order: 2,
    createdBy: 'admin'
  },
  {
    categoryId: '', // Will be set dynamically
    name: 'International Cuisine',
    slug: 'international-cuisine',
    description: 'Global flavors and tastes',
    seoTitle: 'International Cuisine Gift Cards',
    seoDescription: 'Gift cards for international restaurants and cuisines',
    seoKeywords: ['international', 'cuisine', 'ethnic food', 'gift cards'],
    bannerImage: '',
    roundedImage: '',
    squareImage: '',
    cardImage: '',
    isActive: true,
    order: 3,
    createdBy: 'admin'
  },
  
  // Retail subcategories
  {
    categoryId: '', // Will be set dynamically
    name: 'Fashion & Clothing',
    slug: 'fashion-clothing',
    description: 'Trendy fashion and apparel',
    seoTitle: 'Fashion Gift Cards',
    seoDescription: 'Gift cards for fashion and clothing stores',
    seoKeywords: ['fashion', 'clothing', 'apparel', 'gift cards'],
    bannerImage: '',
    roundedImage: '',
    squareImage: '',
    cardImage: '',
    isActive: true,
    order: 1,
    createdBy: 'admin'
  },
  {
    categoryId: '', // Will be set dynamically
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets and technology',
    seoTitle: 'Electronics Gift Cards',
    seoDescription: 'Gift cards for electronics and technology stores',
    seoKeywords: ['electronics', 'technology', 'gadgets', 'gift cards'],
    bannerImage: '',
    roundedImage: '',
    squareImage: '',
    cardImage: '',
    isActive: true,
    order: 2,
    createdBy: 'admin'
  },
  
  // Services subcategories
  {
    categoryId: '', // Will be set dynamically
    name: 'Beauty & Spa',
    slug: 'beauty-spa',
    description: 'Relaxation and beauty treatments',
    seoTitle: 'Beauty & Spa Gift Cards',
    seoDescription: 'Gift cards for beauty salons and spa treatments',
    seoKeywords: ['beauty', 'spa', 'salon', 'treatments', 'gift cards'],
    bannerImage: '',
    roundedImage: '',
    squareImage: '',
    cardImage: '',
    isActive: true,
    order: 1,
    createdBy: 'admin'
  },
  {
    categoryId: '', // Will be set dynamically
    name: 'Fitness & Wellness',
    slug: 'fitness-wellness',
    description: 'Health and fitness services',
    seoTitle: 'Fitness Gift Cards',
    seoDescription: 'Gift cards for gyms, fitness centers and wellness services',
    seoKeywords: ['fitness', 'gym', 'wellness', 'health', 'gift cards'],
    bannerImage: '',
    roundedImage: '',
    squareImage: '',
    cardImage: '',
    isActive: true,
    order: 2,
    createdBy: 'admin'
  }
];

// Sample sub-subcategories data
const sampleSubSubcategories: Omit<SubSubcategory, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Fast Food sub-subcategories
  {
    categoryId: '', // Will be set dynamically
    subcategoryId: '', // Will be set dynamically
    name: 'Burgers & Fries',
    slug: 'burgers-fries',
    description: 'Classic burger joints',
    seoTitle: 'Burger Gift Cards',
    seoDescription: 'Gift cards for burger restaurants and fast food',
    seoKeywords: ['burgers', 'fries', 'fast food', 'gift cards'],
    bannerImage: '',
    roundedImage: '',
    squareImage: '',
    cardImage: '',
    isActive: true,
    order: 1,
    createdBy: 'admin'
  },
  {
    categoryId: '', // Will be set dynamically
    subcategoryId: '', // Will be set dynamically
    name: 'Pizza & Italian',
    slug: 'pizza-italian',
    description: 'Delicious pizza and Italian cuisine',
    seoTitle: 'Pizza Gift Cards',
    seoDescription: 'Gift cards for pizza restaurants and Italian food',
    seoKeywords: ['pizza', 'italian', 'pasta', 'gift cards'],
    bannerImage: '',
    roundedImage: '',
    squareImage: '',
    cardImage: '',
    isActive: true,
    order: 2,
    createdBy: 'admin'
  }
];

export async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...');
    
    // Create categories
    const categoryIds: { [key: string]: string } = {};
    for (const category of sampleCategories) {
      const id = await FirebaseService.createCategory(category);
      categoryIds[category.slug] = id;
      console.log(`✅ Created category: ${category.name} (${id})`);
    }
    
    // Create subcategories with proper categoryId references
    for (const subcategory of sampleSubcategories) {
      // Map subcategories to their parent categories
      let categoryId = '';
      if (['fast-food', 'fine-dining', 'international-cuisine'].includes(subcategory.slug)) {
        categoryId = categoryIds['restaurants'];
      } else if (['fashion-clothing', 'electronics'].includes(subcategory.slug)) {
        categoryId = categoryIds['retail'];
      } else if (['beauty-spa', 'fitness-wellness'].includes(subcategory.slug)) {
        categoryId = categoryIds['services'];
      }
      
      if (categoryId) {
        const subcategoryWithId = { ...subcategory, categoryId };
        const id = await FirebaseService.createSubcategory(subcategoryWithId);
        console.log(`✅ Created subcategory: ${subcategory.name} (${id})`);
      }
    }
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

// Function to check if database is empty
export async function isDatabaseEmpty(): Promise<boolean> {
  try {
    const categories = await FirebaseService.getCategories();
    return categories.length === 0;
  } catch (error) {
    console.error('Error checking database:', error);
    return true; // Assume empty if error
  }
} 