import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {AppText} from '../../../components/AppText';
import {ImageComponent} from '../../../components/AppImage';
import AppButton from '../../../components/appButton';
import {colors} from '../../../constants';
import {ms, vs} from '../../../utils/responsive';
import {routes} from '../../../navigation/route';
import {
  pickImageFromLibrary,
  takePhotoWithCamera,
  validateImage,
  requestImagePermissions,
} from '../../../utils/imagePicker';
import AppHeader from '../../../components/appHeader';
import AppToast from '../../../components/toaster';
import {useAddCatalogData} from '../../../services/queries/app/catlog/addCatalogs';
import Loader from '../../../components/loader';

const MAX_IMAGES = 6;
const INITIAL_SLOTS = 2;

interface ImageSlot {
  id: string;
  uri: string | null;
}

const LotImagesScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const route = useRoute<any>();
  const formData = route.params?.data;
  const sale = route.params?.sale;
  const templateId = route.params?.templateId;
  const {width: screenWidth} = useWindowDimensions();
  const {mutateAsync: addCatalogData, isPending} = useAddCatalogData();

  const [slots, setSlots] = useState<ImageSlot[]>(
    Array.from({length: INITIAL_SLOTS}, (_, i) => ({
      id: i.toString(),
      uri: null,
    })),
  );

  const horizontalPadding = ms(15) * 2;
  const gap = ms(10);
  const imageWidth = (screenWidth - horizontalPadding - gap) / 2;

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSlots(
          Array.from({length: INITIAL_SLOTS}, (_, i) => ({
            id: i.toString(),
            uri: null,
          })),
        );
      };
    }, []),
  );

  useEffect(() => {
    // Request permissions on component mount (especially for Android)
    const initPermissions = async () => {
      const granted = await requestImagePermissions();
      if (!granted) {
        AppToast.error('Camera and storage permissions are required');
      }
    };
    initPermissions();
  }, []);

  const handleBack = () => navigation.goBack();

  const handleDone = async () => {
    const hasImages = slots.some(slot => slot.uri !== null);

    if (!hasImages) {
      AppToast.error('Please add at least one photo');
      return;
    }

    if (!sale?.saleId) {
      AppToast.error('Missing sale');
      return;
    }

    const catalogDataPayload = Object.keys(formData || {}).map(key => {
      const field = formData[key];

      if (typeof field === 'object' && field !== null) {
        return {
          label: field.label,
          id: field.id,
          value: field.value,
        };
      }

      // normal fields
      return {
        label: key,
        value: field,
      };
    });

    const multipartData = new FormData();
    multipartData.append('saleId', sale?.saleId);
    // multipartData.append('templateId', templateId);

    multipartData.append('catalogData', JSON.stringify(catalogDataPayload));

    // ✅ append images
    slots
      ?.filter(slot => slot.uri)
      ?.forEach((slot, index) => {
        const uri = slot.uri as string;

        const extension = uri?.split('.').pop()?.toLowerCase();

        const fileType =
          extension === 'png'
            ? 'image/png'
            : extension === 'webp'
            ? 'image/webp'
            : 'image/jpeg';

        multipartData.append('Photos', {
          uri,
          name: `photo-${Date.now()}-${index}.${extension || 'jpg'}`,
          type: fileType,
        } as any);
      });

    try {
      const response = await addCatalogData({
        payload: multipartData,
      });

      if (response?.status) {
        navigation.navigate(routes.catalogScreen, {sale: sale});
      }
    } catch (error) {}
  };

  const addImageToSlot = (uri: string) => {
    const emptyIndex = slots.findIndex(slot => slot.uri === null);
    if (emptyIndex !== -1) {
      const updated = [...slots];
      updated[emptyIndex] = {...updated[emptyIndex], uri};
      setSlots(updated);
      AppToast.success('Photo added');
    } else if (slots.length < MAX_IMAGES) {
      // Add a new slot and fill it
      const newSlot = {id: slots.length.toString(), uri};
      setSlots([...slots, newSlot]);
      AppToast.success('Photo added');
    } else {
      AppToast.error(`Maximum ${MAX_IMAGES} photos reached`);
    }
  };

  const handleChooseFromLibrary = async () => {
    try {
      const result = await pickImageFromLibrary();
      const validation = validateImage(result);
      if (!validation.isValid) {
        AppToast.error(validation.error || 'Invalid image');
        return;
      }
      if (result.uri) {
        addImageToSlot(result.uri);
      }
    } catch (error) {
      AppToast.error('Failed to pick image from library');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const result = await takePhotoWithCamera();
      const validation = validateImage(result);
      if (!validation.isValid) {
        AppToast.error(validation.error || 'Invalid image');
        return;
      }
      if (result.uri) {
        addImageToSlot(result.uri);
      }
    } catch (error) {
      AppToast.error('Failed to take photo');
    }
  };

  const removeImage = (index: number) => {
    const updated = [...slots];
    updated[index] = {...updated[index], uri: null};
    setSlots(updated);
    AppToast.success('Photo removed');
  };

  const renderImageSlot = (slot: ImageSlot, index: number) => (
    <View
      key={slot.id}
      style={[
        styles.imageSlot,
        {width: imageWidth, height: imageWidth * 0.75},
      ]}>
      {slot.uri && (
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => removeImage(index)}>
          <Icon name="close" size={ms(14)} color={colors.primary} />
        </TouchableOpacity>
      )}
      {slot.uri ? (
        <ImageComponent
          source={{uri: slot.uri}}
          style={styles.actualImage}
          resizeMode="cover"
        />
      ) : (
        <TouchableOpacity
          style={styles.imagePlaceholder}
          onPress={handleChooseFromLibrary}
          activeOpacity={0.7}>
          <Icon name="camera-outline" size={ms(28)} color="#9CA3AF" />
          <AppText
            title="Add Photo"
            fontySize="px10"
            color="textSecondary"
            marginTop={vs(4)}
          />
        </TouchableOpacity>
      )}
    </View>
  );

  const imageCount = slots.filter(slot => slot.uri !== null).length;

  return (
    <View style={styles.container}>
      <Loader isLoading={isPending} />
      <AppHeader
        title={`Lot ${formData?.Lot} - Images`}
        subtitle="Step 3 - Add Photos"
        leftIcon="chevron-back"
        onLeftPress={handleBack}
      />

      <View style={styles.stepTitleContainer}>
        <AppText
          title="Add Images"
          fontySize="px14"
          fontFamily="bold"
          color="textPrimary"
        />
      </View>

      <View style={styles.photoCountContainer}>
        <AppText
          title={`${imageCount} / ${MAX_IMAGES} photos`}
          fontySize="px14"
          color="textSecondary"
        />
      </View>

      <View style={styles.contentArea}>
        <ScrollView
          style={styles.imageGridContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={[styles.imageGrid, {gap}]}>
            {slots.map((slot, index) => renderImageSlot(slot, index))}
          </View>

          <View style={styles.actionButtons}>
            <AppButton
              title="Choose from Library"
              onPress={handleChooseFromLibrary}
              style={styles.primaryBtn}
            />
            <AppButton
              title="Take Photo"
              onPress={handleTakePhoto}
              style={styles.primaryBtn}
            />
          </View>

          <TouchableOpacity style={styles.importLink}>
            <Icon
              name="information-circle-outline"
              size={ms(16)}
              color={colors.primary}
            />
            <AppText
              title="Import Photos by Lot"
              fontySize="px12"
              color="primary"
              marginLeft={ms(5)}
            />
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View
        style={[
          styles.bottomButtons,
          {paddingBottom: vs(12) + insets.bottom, paddingTop: vs(12)},
        ]}>
        <AppButton
          title="Back"
          onPress={handleBack}
          style={styles.cancelBtn}
          textColor="textSecondary"
          bgColor="white"
          borderColor="border"
          transparent={false}
        />
        <AppButton title="Save" onPress={handleDone} style={styles.nextBtn} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F9FAFB'},
  stepTitleContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: ms(15),
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  photoCountContainer: {
    alignItems: 'center',
    paddingVertical: vs(8),
    backgroundColor: '#F9FAFB',
  },
  contentArea: {flex: 1},
  imageGridContainer: {flex: 1, paddingHorizontal: ms(15)},
  scrollContent: {paddingBottom: vs(20)},
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: vs(20),
  },
  imageSlot: {
    marginBottom: vs(10),
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  removeBtn: {
    position: 'absolute',
    top: vs(6),
    right: ms(6),
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  actualImage: {width: '100%', height: '100%', borderRadius: 8},
  actionButtons: {marginBottom: vs(20)},
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: vs(12),
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: vs(10),
  },
  importLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(10),
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: ms(15),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelBtn: {
    flex: 1,
    height: vs(44),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(10),
  },
  nextBtn: {
    flex: 1,
    height: vs(44),
    backgroundColor: colors.primary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: ms(10),
  },
});

export default LotImagesScreen;
