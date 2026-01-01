/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  //Depedency Injection
  constructor(private readonly configService: ConfigService) {}
  // Configure once when module loads
  onModuleInit() {
    cloudinary.config({
      cloud_name: this.configService.get<string>('cloudinary_cloud_name'),
      api_key: this.configService.get<string>('cloudinary_api_key'),
      api_secret: this.configService.get<string>('cloudinary_api_secret'),
    });
  }
  async delete(publicId: string, resourceType: 'image') {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  }
  extractPublicId(secureUrl: string): string {
    if (!secureUrl.includes('/upload/')) {
      throw new Error('Invalid Cloudinary URL');
    }
    // Step 1: Get everything after /upload/
    let publicIdWithExt = secureUrl.split('/upload/')[1];
    // Step 2: Remove version (v123456/)
    publicIdWithExt = publicIdWithExt.replace(/^v\d+\//, '');
    // Step 3: Remove query params if any
    publicIdWithExt = publicIdWithExt.split('?')[0];
    // Step 4: Remove file extension
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
    return publicId;
  }
  async upload(base64File: string, resourceType: 'image') {
    const result = await cloudinary.uploader.upload(base64File, {
      resource_type: resourceType,
    });
    return result.secure_url;
  }
}
