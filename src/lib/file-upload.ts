// ImgBB API configuration
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || 'f47e8ffa81cf4ab42baace21c8bd3e37';
const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload';

export class FileUploadService {
  /**
   * Upload a single file to ImgBB
   * @param file - The file to upload
   * @param fileName - Optional custom filename
   * @returns Promise<string> - The download URL
   */
  static async uploadFile(file: File, fileName?: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('key', IMGBB_API_KEY);
      
      if (fileName) {
        formData.append('name', fileName);
      }

      const response = await fetch(IMGBB_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type header for FormData
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ImgBB upload failed:', response.status, errorText);
        throw new Error(`Failed to upload file: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error?.message || 'Upload failed');
      }
      
      return data.data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      // Return a placeholder URL or throw a more specific error
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple files to ImgBB
   * @param files - Array of files to upload
   * @returns Promise<string[]> - Array of download URLs
   */
  static async uploadMultipleFiles(files: File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file));
      const urls = await Promise.all(uploadPromises);
      return urls;
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw new Error('Failed to upload files');
    }
  }

  /**
   * Upload business application documents
   * @param documents - Object containing document files
   * @param userId - User ID for organizing files
   * @returns Promise<object> - Object with document URLs
   */
  static async uploadBusinessDocuments(
    documents: {
      registrationCertificate: File | null;
      businessLicense: File | null;
      taxCertificate: File | null;
    },
    userId: string
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
          `registration-certificate-${userId}`
        );
      }

      if (documents.businessLicense) {
        uploadedDocs.businessLicense = await this.uploadFile(
          documents.businessLicense,
          `business-license-${userId}`
        );
      }

      if (documents.taxCertificate) {
        uploadedDocs.taxCertificate = await this.uploadFile(
          documents.taxCertificate,
          `tax-certificate-${userId}`
        );
      }

      return uploadedDocs;
    } catch (error) {
      console.error('Error uploading business documents:', error);
      throw new Error('Failed to upload business documents');
    }
  }

  /**
   * Upload business photos
   * @param photos - Array of photo files
   * @param userId - User ID for organizing files
   * @returns Promise<string[]> - Array of photo URLs
   */
  static async uploadBusinessPhotos(photos: File[], userId: string): Promise<string[]> {
    try {
      const uploadPromises = photos.map((photo, index) => 
        this.uploadFile(photo, `business-photo-${userId}-${index}`)
      );
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading business photos:', error);
      throw new Error('Failed to upload business photos');
    }
  }

  /**
   * Upload business logo
   * @param logo - Logo file
   * @param userId - User ID for organizing files
   * @returns Promise<string> - Logo URL
   */
  static async uploadBusinessLogo(logo: File, userId: string): Promise<string> {
    try {
      return await this.uploadFile(logo, `business-logo-${userId}`);
    } catch (error) {
      console.error('Error uploading business logo:', error);
      throw new Error('Failed to upload business logo');
    }
  }
} 