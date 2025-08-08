'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import AdminLayout from '@/components/AdminLayout';
import { FirebaseService } from '@/lib/firebase-admin';
import { Category } from '@/types/admin';
import { 
  ArrowLeftIcon,
  PhotoIcon,
  EyeIcon,
  EyeSlashIcon,
  StarIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';

// ImgBB API configuration
const IMGBB_API_KEY = 'f47e8ffa81cf4ab42baace21c8bd3e37';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export default function CreateSubcategoryPage() {
  const { user, isAdmin, loading } = useAdmin();
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    order: 1,
    isActive: true
  });
  const [images, setImages] = useState({
    bannerImage: '',
    roundedImage: '',
    squareImage: '',
    cardImage: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (categoryId && isAdmin) {
      loadCategory();
    }
  }, [categoryId, isAdmin]);

  const loadCategory = async () => {
    try {
      const categoryData = await FirebaseService.getCategory(categoryId);
      if (categoryData) {
        setCategory(categoryData);
      } else {
        alert('Category not found');
        router.push('/admin/categories');
      }
    } catch (error) {
      console.error('Error loading category:', error);
      alert('Error loading category');
      router.push('/admin/categories');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const uploadImageToImgBB = async (file: File, imageType: string): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', IMGBB_API_KEY);

    const response = await fetch(IMGBB_UPLOAD_URL, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.data.url;
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadLoading(imageType);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const imageUrl = await uploadImageToImgBB(file, imageType);
      setImages(prev => ({
        ...prev,
        [imageType]: imageUrl
      }));

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploadLoading(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.slug.trim()) {
      newErrors.slug = 'Slug is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.seoTitle.trim()) {
      newErrors.seoTitle = 'SEO Title is required';
    }
    
    if (!formData.seoDescription.trim()) {
      newErrors.seoDescription = 'SEO Description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setFormLoading(true);
      
      const subcategoryData = {
        ...formData,
        categoryId,
        seoKeywords: formData.seoKeywords.split(',').map(k => k.trim()).filter(k => k),
        ...images,
        createdBy: user?.uid || 'admin'
      };
      
      await FirebaseService.createSubcategory(subcategoryData);
      
      router.push(`/admin/categories/${categoryId}/subcategories`);
    } catch (error) {
      console.error('Error creating subcategory:', error);
      alert('Error creating subcategory. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-600"
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Subcategory</h1>
            <p className="mt-1 text-sm text-gray-500">
              Add a new subcategory to {category?.name || 'this category'}.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Subcategory Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.name ? 'border-red-300' : ''
                    }`}
                    placeholder="e.g., Fast Food"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                    Slug *
                  </label>
                  <input
                    type="text"
                    name="slug"
                    id="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.slug ? 'border-red-300' : ''
                    }`}
                    placeholder="e.g., fast-food"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.description ? 'border-red-300' : ''
                    }`}
                    placeholder="Describe this subcategory..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="order"
                    id="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* SEO Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700">
                    SEO Title *
                  </label>
                  <input
                    type="text"
                    name="seoTitle"
                    id="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.seoTitle ? 'border-red-300' : ''
                    }`}
                    placeholder="e.g., Best Fast Food - Gift Cards & Dining"
                  />
                  {errors.seoTitle && (
                    <p className="mt-1 text-sm text-red-600">{errors.seoTitle}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">
                    SEO Description *
                  </label>
                  <textarea
                    name="seoDescription"
                    id="seoDescription"
                    rows={2}
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${
                      errors.seoDescription ? 'border-red-300' : ''
                    }`}
                    placeholder="Brief description for search engines..."
                  />
                  {errors.seoDescription && (
                    <p className="mt-1 text-sm text-red-600">{errors.seoDescription}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700">
                    SEO Keywords
                  </label>
                  <input
                    type="text"
                    name="seoKeywords"
                    id="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="fast food, quick meals, dining, gift cards (comma separated)"
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Images</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label htmlFor="bannerImage" className="block text-sm font-medium text-gray-700">
                    Banner Image
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Recommended size: 1200×300 pixels</p>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex flex-col space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'bannerImage')}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {uploadLoading === 'bannerImage' && (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-xs text-gray-500">Uploading...</span>
                          </div>
                        )}
                        {images.bannerImage && (
                          <div className="mt-2">
                            <img 
                              src={images.bannerImage} 
                              alt="Banner preview" 
                              className="w-full h-8 object-cover rounded"
                            />
                            <p className="text-xs text-gray-500 mt-1">Banner (1200×300px)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="roundedImage" className="block text-sm font-medium text-gray-700">
                    Rounded Image
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Recommended size: 200×200 pixels</p>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex flex-col space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'roundedImage')}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {uploadLoading === 'roundedImage' && (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-xs text-gray-500">Uploading...</span>
                          </div>
                        )}
                        {images.roundedImage && (
                          <div className="mt-2">
                            <img 
                              src={images.roundedImage} 
                              alt="Rounded preview" 
                              className="w-12 h-12 object-cover rounded-full mx-auto"
                            />
                            <p className="text-xs text-gray-500 mt-1 text-center">Rounded (200×200px)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="squareImage" className="block text-sm font-medium text-gray-700">
                    Square Image
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Recommended size: 300×300 pixels</p>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex flex-col space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'squareImage')}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {uploadLoading === 'squareImage' && (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-xs text-gray-500">Uploading...</span>
                          </div>
                        )}
                        {images.squareImage && (
                          <div className="mt-2">
                            <img 
                              src={images.squareImage} 
                              alt="Square preview" 
                              className="w-12 h-12 object-cover rounded mx-auto"
                            />
                            <p className="text-xs text-gray-500 mt-1 text-center">Square (300×300px)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="cardImage" className="block text-sm font-medium text-gray-700">
                    Card Image
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Recommended size: 400×250 pixels</p>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex flex-col space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'cardImage')}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        {uploadLoading === 'cardImage' && (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-xs text-gray-500">Uploading...</span>
                          </div>
                        )}
                        {images.cardImage && (
                          <div className="mt-2">
                            <img 
                              src={images.cardImage} 
                              alt="Card preview" 
                              className="w-full h-8 object-cover rounded"
                            />
                            <p className="text-xs text-gray-500 mt-1">Card (400×250px)</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Image Guidelines */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Image Guidelines</h4>
                <div className="text-xs text-blue-800 space-y-1">
                  <p><strong>Banner Image (1200×300px):</strong> Used for subcategory headers and hero sections</p>
                  <p><strong>Rounded Image (200×200px):</strong> Used for subcategory cards and thumbnails</p>
                  <p><strong>Square Image (300×300px):</strong> Used for detailed views and galleries</p>
                  <p><strong>Card Image (400×250px):</strong> Used for subcategory cards and featured displays</p>
                  <p className="mt-2"><strong>Format:</strong> JPG, PNG, or WebP recommended for best performance</p>
                  <p><strong>Max Size:</strong> 5MB per image</p>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 flex items-center text-sm text-gray-700">
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Active Subcategory
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {formLoading ? 'Creating...' : 'Create Subcategory'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
} 