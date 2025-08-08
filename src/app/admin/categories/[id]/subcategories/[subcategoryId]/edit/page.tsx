'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAdmin } from '@/hooks/useAdmin';
import AdminLayout from '@/components/AdminLayout';
import { FirebaseService } from '@/lib/firebase-admin';
import { Category, Subcategory } from '@/types/admin';
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

export default function EditSubcategoryPage() {
  const { user, isAdmin, loading } = useAdmin();
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const subcategoryId = params.subcategoryId as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null);
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
  const [loadingSubcategory, setLoadingSubcategory] = useState(true);

  useEffect(() => {
    if (categoryId && subcategoryId && isAdmin) {
      loadData();
    }
  }, [categoryId, subcategoryId, isAdmin]);

  const loadData = async () => {
    try {
      setLoadingSubcategory(true);
      const [categoryData, subcategoryData] = await Promise.all([
        FirebaseService.getCategory(categoryId),
        FirebaseService.getSubcategory(subcategoryId)
      ]);
      
      if (categoryData) {
        setCategory(categoryData);
      }
      
      if (subcategoryData) {
        setSubcategory(subcategoryData);
        setFormData({
          name: subcategoryData.name,
          slug: subcategoryData.slug,
          description: subcategoryData.description,
          seoTitle: subcategoryData.seoTitle,
          seoDescription: subcategoryData.seoDescription,
          seoKeywords: subcategoryData.seoKeywords.join(', '),
          order: subcategoryData.order,
          isActive: subcategoryData.isActive
        });
        setImages({
          bannerImage: subcategoryData.bannerImage,
          roundedImage: subcategoryData.roundedImage,
          squareImage: subcategoryData.squareImage,
          cardImage: subcategoryData.cardImage
        });
      } else {
        alert('Subcategory not found');
        router.push(`/admin/categories/${categoryId}/subcategories`);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error loading subcategory');
      router.push(`/admin/categories/${categoryId}/subcategories`);
    } finally {
      setLoadingSubcategory(false);
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
      body: formData,
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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadLoading(imageType);
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
        seoKeywords: formData.seoKeywords.split(',').map(k => k.trim()).filter(k => k),
        ...images,
        updatedAt: new Date()
      };

      await FirebaseService.updateSubcategory(subcategoryId, subcategoryData);
      
      alert('Subcategory updated successfully!');
      router.push(`/admin/categories/${categoryId}/subcategories`);
    } catch (error) {
      console.error('Error updating subcategory:', error);
      alert('Error updating subcategory. Please try again.');
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

  if (loadingSubcategory) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading subcategory...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit Subcategory
                {category && (
                  <span className="text-lg font-normal text-gray-500 ml-2">
                    - {category.name}
                  </span>
                )}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Update subcategory information and images.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter subcategory name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                    Slug *
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.slug ? 'border-red-500' : ''
                    }`}
                    placeholder="subcategory-slug"
                  />
                  {errors.slug && <p className="mt-1 text-sm text-red-600">{errors.slug}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.description ? 'border-red-500' : ''
                    }`}
                    placeholder="Enter subcategory description"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
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
                    id="seoTitle"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.seoTitle ? 'border-red-500' : ''
                    }`}
                    placeholder="SEO optimized title"
                  />
                  {errors.seoTitle && <p className="mt-1 text-sm text-red-600">{errors.seoTitle}</p>}
                </div>

                <div>
                  <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700">
                    SEO Description *
                  </label>
                  <textarea
                    id="seoDescription"
                    name="seoDescription"
                    rows={3}
                    value={formData.seoDescription}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.seoDescription ? 'border-red-500' : ''
                    }`}
                    placeholder="SEO optimized description"
                  />
                  {errors.seoDescription && <p className="mt-1 text-sm text-red-600">{errors.seoDescription}</p>}
                </div>

                <div>
                  <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700">
                    SEO Keywords
                  </label>
                  <input
                    type="text"
                    id="seoKeywords"
                    name="seoKeywords"
                    value={formData.seoKeywords}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <p className="mt-1 text-sm text-gray-500">Separate keywords with commas</p>
                </div>
              </div>
            </div>

            {/* Images */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Images</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* Banner Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Banner Image
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Recommended size: 1200×300 pixels</p>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'bannerImage')}
                      className="hidden"
                      id="bannerImage"
                    />
                    <label
                      htmlFor="bannerImage"
                      className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400"
                    >
                      {uploadLoading === 'bannerImage' ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                        </div>
                      ) : images.bannerImage ? (
                        <div>
                          <img
                            src={images.bannerImage}
                            alt="Banner preview"
                            className="w-full h-8 object-cover rounded"
                          />
                          <p className="text-xs text-gray-500 mt-1">Banner Image</p>
                        </div>
                      ) : (
                        <div>
                          <CloudArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">Upload Banner Image</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Rounded Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rounded Image
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Recommended size: 200×200 pixels</p>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'roundedImage')}
                      className="hidden"
                      id="roundedImage"
                    />
                    <label
                      htmlFor="roundedImage"
                      className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400"
                    >
                      {uploadLoading === 'roundedImage' ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                        </div>
                      ) : images.roundedImage ? (
                        <div>
                          <img
                            src={images.roundedImage}
                            alt="Rounded preview"
                            className="w-12 h-12 object-cover rounded-full mx-auto"
                          />
                          <p className="text-xs text-gray-500 mt-1">Rounded Image</p>
                        </div>
                      ) : (
                        <div>
                          <CloudArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">Upload Rounded Image</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Square Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Square Image
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Recommended size: 300×300 pixels</p>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'squareImage')}
                      className="hidden"
                      id="squareImage"
                    />
                    <label
                      htmlFor="squareImage"
                      className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400"
                    >
                      {uploadLoading === 'squareImage' ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                        </div>
                      ) : images.squareImage ? (
                        <div>
                          <img
                            src={images.squareImage}
                            alt="Square preview"
                            className="w-12 h-12 object-cover rounded mx-auto"
                          />
                          <p className="text-xs text-gray-500 mt-1">Square Image</p>
                        </div>
                      ) : (
                        <div>
                          <CloudArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">Upload Square Image</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Card Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Image
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Recommended size: 400×250 pixels</p>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'cardImage')}
                      className="hidden"
                      id="cardImage"
                    />
                    <label
                      htmlFor="cardImage"
                      className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400"
                    >
                      {uploadLoading === 'cardImage' ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                          <span className="ml-2 text-sm text-gray-600">Uploading...</span>
                        </div>
                      ) : images.cardImage ? (
                        <div>
                          <img
                            src={images.cardImage}
                            alt="Card preview"
                            className="w-full h-8 object-cover rounded"
                          />
                          <p className="text-xs text-gray-500 mt-1">Card Image</p>
                        </div>
                      ) : (
                        <div>
                          <CloudArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">Upload Card Image</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Settings</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    min="1"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>
            </div>

            {/* Image Guidelines */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Image Guidelines</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>Banner Image:</strong> Used for category headers and hero sections</li>
                <li>• <strong>Rounded Image:</strong> Used for profile pictures and small displays</li>
                <li>• <strong>Square Image:</strong> Used for grid layouts and thumbnails</li>
                <li>• <strong>Card Image:</strong> Used for card layouts and featured displays</li>
                <li>• <strong>Format:</strong> JPG, PNG, or WebP recommended</li>
                <li>• <strong>Max Size:</strong> 5MB per image</li>
              </ul>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
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
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Update Subcategory'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
} 