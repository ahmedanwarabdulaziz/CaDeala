import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { SupabaseFileService } from './supabase';

export type StorageProvider = 'firebase' | 'supabase';

export interface UploadOptions {
  provider?: StorageProvider;
  bucket?: string;
  path?: string;
  fileName?: string;
  cacheControl?: string;
  upsert?: boolean;
}

export class EnhancedFileUploadService {
  /**
   * Upload a single file with provider selection
   */
  static async uploadFile(
    file: File, 
    options: UploadOptions = {}
  ): Promise<string> {
    const {
      provider = 'supabase', // Default to Supabase for better performance
      bucket = 'gift-app-files',
      path = 'uploads',
      fileName,
      cacheControl,
      upsert
    } = options;

    try {
      if (provider === 'supabase') {
        return await SupabaseFileService.uploadFile(file, bucket, path, {
          cacheControl,
          upsert
        });
      } else {
        // Fallback to Firebase
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const finalFileName = fileName || `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
        const storageRef = ref(storage, `${path}/${finalFileName}`);
        
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return downloadURL;
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadMultipleFiles(
    files: File[], 
    options: UploadOptions = {}
  ): Promise<string[]> {
    const { provider = 'supabase', bucket = 'gift-app-files', path = 'uploads' } = options;

    try {
      if (provider === 'supabase') {
        return await SupabaseFileService.uploadMultipleFiles(files, bucket, path);
      } else {
        // Fallback to Firebase
        const uploadPromises = files.map(file => this.uploadFile(file, options));
        return await Promise.all(uploadPromises);
      }
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw new Error('Failed to upload files');
    }
  }

  /**
   * Upload business application documents (optimized for Supabase)
   */
  static async uploadBusinessDocuments(
    documents: {
      registrationCertificate: File | null;
      businessLicense: File | null;
      taxCertificate: File | null;
    },
    userId: string,
    provider: StorageProvider = 'supabase'
  ): Promise<{
    registrationCertificate?: string;
    businessLicense?: string;
    taxCertificate?: string;
  }> {
    const uploadedDocs: any = {};

    try {
      if (documents.registrationCertificate) {
        uploadedDocs.registrationCertificate = await this.uploadFile(
          documents.registrationCertificate,
          {
            provider,
            bucket: 'business-documents',
            path: `${userId}/documents`,
            fileName: 'registration-certificate'
          }
        );
      }

      if (documents.businessLicense) {
        uploadedDocs.businessLicense = await this.uploadFile(
          documents.businessLicense,
          {
            provider,
            bucket: 'business-documents',
            path: `${userId}/documents`,
            fileName: 'business-license'
          }
        );
      }

      if (documents.taxCertificate) {
        uploadedDocs.taxCertificate = await this.uploadFile(
          documents.taxCertificate,
          {
            provider,
            bucket: 'business-documents',
            path: `${userId}/documents`,
            fileName: 'tax-certificate'
          }
        );
      }

      return uploadedDocs;
    } catch (error) {
      console.error('Error uploading business documents:', error);
      throw new Error('Failed to upload business documents');
    }
  }

  /**
   * Upload business photos (optimized for Supabase)
   */
  static async uploadBusinessPhotos(
    photos: File[], 
    userId: string,
    provider: StorageProvider = 'supabase'
  ): Promise<string[]> {
    return this.uploadMultipleFiles(photos, {
      provider,
      bucket: 'business-photos',
      path: `${userId}/photos`
    });
  }

  /**
   * Upload business logo (optimized for Supabase)
   */
  static async uploadBusinessLogo(
    logo: File, 
    userId: string,
    provider: StorageProvider = 'supabase'
  ): Promise<string> {
    return this.uploadFile(logo, {
      provider,
      bucket: 'business-logos',
      path: `${userId}`,
      fileName: 'logo'
    });
  }

  /**
   * Upload category images (admin only, optimized for Supabase)
   */
  static async uploadCategoryImages(
    images: {
      banner?: File;
      rounded?: File;
      square?: File;
    },
    categoryId: string,
    provider: StorageProvider = 'supabase'
  ): Promise<{
    banner?: string;
    rounded?: string;
    square?: string;
  }> {
    const uploadedImages: any = {};

    try {
      if (images.banner) {
        uploadedImages.banner = await this.uploadFile(images.banner, {
          provider,
          bucket: 'category-images',
          path: `${categoryId}`,
          fileName: 'banner'
        });
      }

      if (images.rounded) {
        uploadedImages.rounded = await this.uploadFile(images.rounded, {
          provider,
          bucket: 'category-images',
          path: `${categoryId}`,
          fileName: 'rounded'
        });
      }

      if (images.square) {
        uploadedImages.square = await this.uploadFile(images.square, {
          provider,
          bucket: 'category-images',
          path: `${categoryId}`,
          fileName: 'square'
        });
      }

      return uploadedImages;
    } catch (error) {
      console.error('Error uploading category images:', error);
      throw new Error('Failed to upload category images');
    }
  }

  /**
   * Delete a file
   */
  static async deleteFile(
    fileUrl: string,
    provider: StorageProvider = 'supabase'
  ): Promise<void> {
    try {
      if (provider === 'supabase') {
        // Extract bucket and path from URL
        const urlParts = fileUrl.split('/');
        const bucket = urlParts[urlParts.length - 3]; // Adjust based on your URL structure
        const path = urlParts.slice(-2).join('/'); // Get the last two parts as path
        
        await SupabaseFileService.deleteFile(bucket, path);
      } else {
        // Firebase deletion would require additional setup
        console.warn('Firebase file deletion not implemented');
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }
} 