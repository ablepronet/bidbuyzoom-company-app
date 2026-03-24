// import ImageCropPicker, {
//   Image as PickerImage,
//   Options as CropPickerOptions,
// } from 'react-native-image-crop-picker';
// import { fontSizes, logs } from '../utils/metrics';
// import React from 'react';
// import {
//   Keyboard,
//   Modal,
//   StyleSheet,
//   Text,
//   View,
//   useWindowDimensions,
// } from 'react-native';
// import AppPressable from './appPressable';

// import {
//   askCameraPermission,
//   askGalleryPermissions,
// } from '../utils/permissionHandler';
// import { ImageComponent } from './AppImage';
// import appImages from '../constants/appImages';
// import { vs } from '../utils/responsive';
// import { appIcons } from '../constants';
// // import RNFS from 'react-native-fs';
// interface PickerOptions {
//   width?: number;
//   height?: number;
//   cropping?: boolean;
//   cropperCircleOverlay?: boolean;
//   mediaType?: 'photo' | 'video' | 'any';
//   compressImageQuality?: number;
//   compressImageMaxWidth?: number;
//   compressImageMaxHeight?: number;
// }

// interface ImagePickerModalProps {
//   visible: boolean;
//   onClose: () => void;
//   onImagePicked: (image: PickerImage) => void;
//   t: any;
//   cropping?: boolean;
//   cropperCircleOverlay?: boolean;
// }

// const defaultOptions: PickerOptions = {
//   mediaType: 'photo',
//   width: 345,
//   height: 550,
//   cropping: true,
//   cropperCircleOverlay: true,
// };

// // const normalizeCameraImage = async (image: PickerImage) => {
// //   const fileName = image.filename ?? `camera_${Date.now()}.jpg`;

// //   const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

// //   await RNFS.copyFile(image.path, destPath);

// //   return {
// //     ...image,
// //     path: `file://${destPath}`,
// //     mime: image.mime || 'image/jpeg',
// //     filename: fileName,
// //   };
// // };

// const openGallery = async (options: PickerOptions = {}) => {
//   try {
//     const image: PickerImage = await ImageCropPicker.openPicker({
//       ...defaultOptions,
//       ...options,
//     } as CropPickerOptions);
//     return image;
//   } catch (error) {
//     logs('❌ Gallery picker cancelled or failed', error);
//     return null;
//   }
// };

// const openCamera = async (options: PickerOptions = {}) => {
//   try {
//     const image: PickerImage = await ImageCropPicker.openCamera({
//       ...defaultOptions,
//       ...options,
//     } as CropPickerOptions);
//     return image;
//   } catch (error) {
//     logs('❌ Camera picker cancelled or failed', error);
//     return null;
//   }
// };

// const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
//   visible,
//   onClose,
//   onImagePicked,
//   t,
//   cropping = true,
//   cropperCircleOverlay = true,
// }) => {
//   const { width, height } = useWindowDimensions();
//   const isLandscape = width > height;

//   const pickerOverrides: PickerOptions = {
//     ...(cropping !== undefined ? { cropping } : {}),
//     ...(cropperCircleOverlay !== undefined ? { cropperCircleOverlay } : {}),
//   };

//   const handleGallery = async () => {
//     Keyboard.dismiss();
//     const granted = await askGalleryPermissions(t);
//     if (!granted) return;

//     try {
//       const image = await openGallery({
//         ...pickerOverrides,
//         compressImageQuality: 0.6,
//         compressImageMaxWidth: 900,
//         compressImageMaxHeight: 900,
//       });

//       if (image) onImagePicked(image);
//     } finally {
//       onClose();
//     }
//   };

//   // const handleCamera = async () => {
//   //   Keyboard.dismiss();
//   //   const granted = await askCameraPermission(t);
//   //   if (!granted) return;

//   //   try {
//   //     const image = await openCamera({
//   //       ...pickerOverrides,
//   //       compressImageQuality: 0.7,
//   //       compressImageMaxWidth: 1200,
//   //       compressImageMaxHeight: 1200,
//   //     });

//   //     if (image) {
//   //       const normalizedImage = await normalizeCameraImage(image);
//   //       onImagePicked(normalizedImage);
//   //     }
//   //   } finally {
//   //     onClose();
//   //   }
//   // };

//   const handleCamera = async () => {
//     Keyboard.dismiss();
//     const granted = await askCameraPermission(t);
//     if (!granted) return;

//     try {
//       const image = await openCamera({
//         ...pickerOverrides,
//         compressImageQuality: 0.7,
//         compressImageMaxWidth: 1200,
//         compressImageMaxHeight: 1200,
//       });

//       if (image) {
//         onImagePicked({
//           ...image,
//           filename: image.filename ?? `camera_${Date.now()}.jpg`,
//         });
//       }
//     } finally {
//       onClose();
//     }
//   };

//   return (
//     <Modal
//       visible={visible}
//       transparent
//       animationType="slide"
//       supportedOrientations={['portrait', 'landscape']}
//     >
//       <View style={styles.overlay}>
//         <AppPressable
//           style={[
//             styles.container,
//             isLandscape ? styles.containerLandscape : styles.containerPortrait,
//           ]}
//           activeOpacity={1}
//           onPress={onClose}
//         >
//           <AppPressable onPress={handleCamera} style={styles.optionWrapper}>
//             <ImageComponent
//               source={appIcons.black.camera}
//               style={styles.icon}
//             />
//             <Text style={styles.option}>Open Camera</Text>
//           </AppPressable>

//           <AppPressable onPress={handleGallery} style={styles.optionWrapper}>
//             <ImageComponent
//               source={appIcons.black.gallery}
//               style={styles.icon}
//             />
//             <Text style={styles.option}>Select from Gallery</Text>
//           </AppPressable>

//           <AppPressable onPress={onClose} style={styles.closeButton}>
//             <ImageComponent
//               source={appIcons.black.closeIcon}
//               style={styles.closeIcon}
//             />
//           </AppPressable>
//         </AppPressable>
//       </View>
//     </Modal>
//   );
// };

// export default ImagePickerModal;

// const styles = StyleSheet.create({
//   overlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.1)',
//     justifyContent: 'flex-end',
//   },
//   container: {
//     backgroundColor: '#fff',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingBottom: vs(40),
//     alignItems: 'center',
//     position: 'relative',
//   },
//   containerPortrait: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingVertical: vs(35),
//   },
//   containerLandscape: {
//     flexDirection: 'row',
//     justifyContent: 'space-evenly',
//     paddingVertical: vs(20),
//   },
//   optionWrapper: {
//     alignItems: 'center',
//     marginHorizontal: 20,
//     marginVertical: 10,
//   },
//   icon: {
//     width: vs(58),
//     height: vs(58),
//     marginBottom: vs(10),
//   },
//   option: {
//     fontSize: fontSizes.px16,
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   closeButton: {
//     position: 'absolute',
//     top: vs(10),
//     right: vs(10),
//   },
//   closeIcon: {
//     width: vs(22),
//     height: vs(22),
//     marginBottom: vs(10),
//   },
// });
import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const ImagePickerModal = () => {
  return (
    <View>
      <Text>ImagePickerModal</Text>
    </View>
  )
}

export default ImagePickerModal

const styles = StyleSheet.create({})