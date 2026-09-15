import { v2 as cloudinary } from 'cloudinary';
import { Provider } from '@nestjs/common';

export const CloudinaryProvider: Provider = {
  provide: 'CLOUDINARY',
  useFactory: () => {
    const url = process.env.CLOUDINARY_URL;
    if (url) {
      const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (match) {
        return cloudinary.config({
          api_key: match[1],
          api_secret: match[2],
          cloud_name: match[3],
        });
      }
    }
    return cloudinary.config();
  },
};
