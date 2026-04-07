import { Alert, Platform } from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType, PhotoQuality } from 'react-native-image-picker';

export interface ImagePickerOptions {
  includeBase64?: boolean;
  includeExtra?: boolean;
  maxHeight?: number;
  maxWidth?: number;
  quality?: PhotoQuality;
  mediaType: MediaType;
}

export interface ImagePickerResult {
  uri: string | null;
  base64?: string;
  fileName?: string;
  fileSize?: number;
  type?: string;
  error?: string;
}

const defaultOptions: ImagePickerOptions = {
  includeBase64: false,
  includeExtra: true,
  maxHeight: 1024,
  maxWidth: 1024,
  quality: 0.8 as PhotoQuality,
  mediaType: 'photo',
};

/**
 * Launch image library to pick photo from gallery
 */
export const pickImageFromLibrary = async (options?: ImagePickerOptions): Promise<ImagePickerResult> => {
  return new Promise((resolve) => {
    const pickerOptions = { ...defaultOptions, ...options };

    launchImageLibrary(pickerOptions, (response: ImagePickerResponse) => {
      handleImagePickerResponse(response, resolve);
    });
  });
};

/**
 * Launch camera to take photo
 */
export const takePhotoWithCamera = async (options?: ImagePickerOptions): Promise<ImagePickerResult> => {
  return new Promise((resolve) => {
    const pickerOptions = { 
      ...defaultOptions, 
      ...options,
      saveToPhotos: false,
    };

    launchCamera(pickerOptions, (response: ImagePickerResponse) => {
      handleImagePickerResponse(response, resolve);
    });
  });
};

/**
 * Handle image picker response and return standardized result
 */
const handleImagePickerResponse = (
  response: ImagePickerResponse, 
  resolve: (value: ImagePickerResult) => void
) => {
  if (response.didCancel) {
    resolve({ uri: null });
    return;
  }

  if (response.errorCode) {
    let errorMessage = 'Unknown error occurred';
    
    switch (response.errorCode) {
      case 'camera_unavailable':
        errorMessage = 'Camera is not available on this device';
        break;
      case 'permission':
        errorMessage = 'Permission to access camera/gallery was denied';
        break;
      case 'others':
        errorMessage = response.errorMessage || 'Unknown error occurred';
        break;
    }
    
    resolve({ uri: null, error: errorMessage });
    return;
  }

  if (response.assets && response.assets[0]) {
    const asset = response.assets[0];
    
    resolve({
      uri: asset.uri || null,
      base64: asset.base64,
      fileName: asset.fileName,
      fileSize: asset.fileSize,
      type: asset.type,
    });
  } else {
    resolve({ uri: null, error: 'No image selected' });
  }
};

/**
 * Show alert to choose between camera and gallery
 */
export const showImagePickerAlert = async (
  options?: ImagePickerOptions
): Promise<ImagePickerResult> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Select Photo',
      'Choose an option to select photo',
      [
        {
          text: 'Camera',
          onPress: async () => {
            const result = await takePhotoWithCamera(options);
            resolve(result);
          },
        },
        {
          text: 'Gallery',
          onPress: async () => {
            const result = await pickImageFromLibrary(options);
            resolve(result);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve({ uri: null }),
        },
      ],
      { cancelable: true }
    );
  });
};

/**
 * Validate image file
 */
export const validateImage = (result: ImagePickerResult): { isValid: boolean; error?: string } => {
  if (!result.uri) {
    return { isValid: false, error: result.error || 'No image selected' };
  }

  if (result.fileSize && result.fileSize > 5 * 1024 * 1024) { // 5MB limit
    return { isValid: false, error: 'Image size should be less than 5MB' };
  }

  const supportedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (result.type && !supportedTypes.includes(result.type)) {
    return { isValid: false, error: 'Unsupported image format. Please use JPEG, PNG, or WebP' };
  }

  return { isValid: true };
};

/**
 * Request camera and gallery permissions (for Android)
 */
export const requestImagePermissions = async (): Promise<boolean> => {
  try {
    // For Android, you might need to request permissions
    // For iOS, permissions are handled by the library automatically
    return true;
  } catch (error) {
    console.error('Permission request failed:', error);
    return false;
  }
};
