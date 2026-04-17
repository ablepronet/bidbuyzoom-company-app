import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {AppText} from '../../../components/AppText';

import {colors} from '../../../constants';
import {ms, vs} from '../../../utils/responsive';
import {routes} from '../../../navigation/route';
import {
  validateLotForm,
  validatePriceRelationships,
} from '../../../utils/validation';
import AppHeader from '../../../components/appHeader';
import {useGetCatalogDataDetails} from '../../../services/queries/app/catlog/getCatlogDetails';
import {ImageComponent} from '../../../components/AppImage';
import Loader from '../../../components/loader';
import AppModal from '../../../components/AppModal';
import AppPressable from '../../../components/appPressable';
import {showImagePickerAlert, validateImage} from '../../../utils/imagePicker';
import {useUpdateCatalogDataDetails} from '../../../services/queries/app/catlog/updateCatlogDetails';

interface SubcategoryItem {
  label: string;
  value: string;
}

interface CategoryItem {
  _id: string;
  label: string;
  value: string;
  subcategoryDatas?: SubcategoryItem[];
}

const MAX_IMAGES = 6;

const LotDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const lot = route.params?.lot;
  const lotId = lot?._id || route.params?._id || '';
  const {data: lotDetailsData, isLoading} = useGetCatalogDataDetails({
    id: lotId,
  });
  const {mutateAsync: updateCatalogItem, isPending: isUpdating} =
    useUpdateCatalogDataDetails();
  const itemData = lotDetailsData?.data;

  const getTextValue = (value: unknown) =>
    value === null || value === undefined ? '' : String(value);

  const hasField = (key: string) =>
    Object.prototype.hasOwnProperty.call(itemData || {}, key);

  useEffect(() => {
    if (lotDetailsData) {
      console.log(
        'catalog item details',
        JSON.stringify(lotDetailsData, null, 2),
      );
    }
  }, [lotDetailsData]);

  const [lotNumber, setLotNumber] = useState(getTextValue(lot?.lotNumber));
  const [inventoryNumber, setInventoryNumber] = useState(
    getTextValue(lot?.inventoryNumber),
  );
  const [quantity, setQuantity] = useState('');
  const [title, setTitle] = useState(getTextValue(lot?.title));
  const [description, setDescription] = useState(
    getTextValue(lot?.description),
  );
  const [startPrice, setStartPrice] = useState(
    getTextValue(lot?.startPrice ?? lot?.currentPrice),
  );
  const [buyNowPrice, setBuyNowPrice] = useState(
    getTextValue(lot?.buyNowPrice),
  );
  const [reserve, setReserve] = useState(getTextValue(lot?.reserve));
  const [lowEstimate, setLowEstimate] = useState(
    getTextValue(lot?.lowEstimate),
  );
  const [highEstimate, setHighEstimate] = useState(
    getTextValue(lot?.highEstimate),
  );
  const [mainCategory, setMainCategory] = useState(
    getTextValue(lot?.mainCategory) || 'Select',
  );
  const [subCategory, setSubCategory] = useState(
    getTextValue(lot?.subCategory) || 'Paintings',
  );
  const [isComplete, setIsComplete] = useState(Boolean(lot?.isComplete));
  const [seller, setSeller] = useState('');
  const [shipping, setShipping] = useState('');
  const [taxExempt, setTaxExempt] = useState('');
  const [notSold, setNotSold] = useState('');
  const [notes, setNotes] = useState('');
  const [dateAdded, setDateAdded] = useState('');
  const [dateEdited, setDateEdited] = useState('');
  const [photos, setPhotos] = useState<string[]>(lot?.photos || []);
  const [removedPhotos, setRemovedPhotos] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [selectedCategoryValue, setSelectedCategoryValue] = useState('');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isSubCategoryModalVisible, setIsSubCategoryModalVisible] =
    useState(false);

  const resetFormState = () => {
    setLotNumber('');
    setInventoryNumber('');
    setQuantity('');
    setTitle('');
    setDescription('');
    setStartPrice('');
    setBuyNowPrice('');
    setReserve('');
    setLowEstimate('');
    setHighEstimate('');
    setMainCategory('');
    setSubCategory('');
    setIsComplete(false);
    setSeller('');
    setShipping('');
    setTaxExempt('');
    setNotSold('');
    setNotes('');
    setDateAdded('');
    setDateEdited('');
    setPhotos([]);
    setRemovedPhotos([]);
    setCategories([]);
    setSelectedCategoryValue('');
    setIsCategoryModalVisible(false);
    setIsSubCategoryModalVisible(false);
  };

  useEffect(() => {
    const item = lotDetailsData?.data;

    if (!item) {
      return;
    }

    setLotNumber(getTextValue(item?.Lot));
    setInventoryNumber(getTextValue(item?.Inventory));
    setQuantity(getTextValue(item?.Quantity));
    setTitle(getTextValue(item?.Title));
    setDescription(getTextValue(item?.Description));
    setStartPrice(getTextValue(item?.Start));
    setBuyNowPrice(getTextValue(item?.['Buy Now']));
    setReserve(getTextValue(item?.Reserve));
    setLowEstimate(getTextValue(item?.['Low Estimate']));
    setHighEstimate(getTextValue(item?.['High Estimate']));
    setMainCategory(getTextValue(item?.['Main Category']) || 'Art');
    setSubCategory(getTextValue(item?.['Sub Category']) || 'Paintings');
    setIsComplete(Boolean(item?.Complete));
    setSeller(getTextValue(item?.Seller));
    setShipping(getTextValue(item?.Shipping));
    setTaxExempt(getTextValue(item?.['Tax Exempt']));
    setNotSold(getTextValue(item?.['Not Sold']));
    setNotes(getTextValue(item?.Notes));
    setDateAdded(getTextValue(item?.['Date Added']));
    setDateEdited(getTextValue(item?.['Date Edited']));
    setPhotos(Array.isArray(item?.Photos) ? item?.Photos : []);
    setRemovedPhotos([]);
    setCategories(
      Array.isArray(lotDetailsData?.categories)
        ? lotDetailsData?.categories
        : [],
    );

    return()=>{
      resetFormState()
    }
  }, [lotDetailsData]);

  useEffect(() => {
    if (!categories?.length) {
      return;
    }

    const matchedCategory = categories?.find(
      category =>
        category?.label?.toLowerCase() === mainCategory?.toLowerCase(),
    );

    setSelectedCategoryValue(
      matchedCategory?.value || matchedCategory?._id || '',
    );
  }, [categories, mainCategory]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    const formData = {
      lotNumber,
      title,
      description,
      quantity: '1',
      startPrice,
      buyNowPrice,
      reserve,
    };

    const validation = validateLotForm(formData);
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.error);
      return;
    }

    if (!lotId) {
      Alert.alert('Error', 'Catalog item id is missing');
      return;
    }

    const catalogDataPayload = [
      {label: 'Lot', value: lotNumber},
      {label: 'Inventory', value: inventoryNumber},
      {label: 'Quantity', value: quantity},
      {label: 'Title', value: title},
      {label: 'Description', value: description},
      {label: 'Start', value: startPrice},
      {label: 'Buy Now', value: buyNowPrice},
      {label: 'Reserve', value: reserve},
      {label: 'Low Estimate', value: lowEstimate},
      {label: 'High Estimate', value: highEstimate},
      {label: 'Main Category', value: mainCategory},
      {label: 'Sub Category', value: subCategory},
      {label: 'Seller', value: seller},
      {label: 'Shipping', value: shipping},
      {label: 'Tax Exempt', value: taxExempt},
      {label: 'Not Sold', value: notSold},
      {label: 'Notes', value: notes},
      {label: 'Date Added', value: dateAdded},
      {label: 'Date Edited', value: dateEdited},
      {label: 'Complete', value: isComplete},
    ].filter(item => hasField(item.label));

    const multipartData = new FormData();
    multipartData.append('catalogData', JSON.stringify(catalogDataPayload));

    if (removedPhotos?.length) {
      multipartData.append('removedPhotos', JSON.stringify(removedPhotos));
    }

    photos
      ?.filter(
        photo =>
          photo?.startsWith('file://') || photo?.startsWith('content://'),
      )
      ?.forEach((photo, index) => {
        const extension = photo?.split('.').pop()?.toLowerCase();
        const fileType =
          extension === 'png'
            ? 'image/png'
            : extension === 'webp'
              ? 'image/webp'
              : 'image/jpeg';

        multipartData.append('Photos', {
          uri: photo,
          name: `photo-${Date.now()}-${index}.${extension || 'jpg'}`,
          type: fileType,
        } as any);
      });

    try {
      const response = await updateCatalogItem({
        id: lotId,
        payload: multipartData,
      });

      if (response?.status) {
        navigation.goBack();
      }
    } catch (error) {}
  };

  const handleAddImage = async () => {
    if ((photos?.length || 0) >= MAX_IMAGES) {
      Alert.alert('Image Limit', `You can upload only ${MAX_IMAGES} images`);
      return;
    }

    const result = await showImagePickerAlert({mediaType: 'photo'});
    const validation = validateImage(result);

    if (!validation.isValid) {
      if (result?.uri || result?.error) {
        Alert.alert(
          'Image Error',
          validation.error || 'Unable to select image',
        );
      }
      return;
    }

    if (result?.uri) {
      setPhotos(prevPhotos => {
        if (prevPhotos.length >= MAX_IMAGES) {
          Alert.alert(
            'Image Limit',
            `You can upload only ${MAX_IMAGES} images`,
          );
          return prevPhotos;
        }

        return [...prevPhotos, result.uri as string];
      });
    }
  };

  const handleDeleteImage = (index: number) => {
    Alert.alert('Delete Photo', 'Do you want to remove this photo?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const deletedPhoto = photos?.[index];

          if (
            deletedPhoto &&
            !deletedPhoto?.startsWith('file://') &&
            !deletedPhoto?.startsWith('content://')
          ) {
            setRemovedPhotos(prevPhotos => [...prevPhotos, deletedPhoto]);
          }

          setPhotos(prevPhotos =>
            prevPhotos.filter((_, itemIndex) => itemIndex !== index),
          );
        },
      },
    ]);
  };

  const renderImage = (image: string, index: number) => (
    <View key={`${image}-${index}`} style={styles.imageContainer}>
      <ImageComponent
        uri={
          image?.startsWith('file://') || image?.startsWith('content://')
            ? undefined
            : image
        }
        source={
          image?.startsWith('file://') || image?.startsWith('content://')
            ? {uri: image}
            : undefined
        }
        style={styles.lotImage}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={styles.deleteImageButton}
        onPress={() => handleDeleteImage(index)}>
        <Icon name="close" size={ms(14)} color={colors.white} />
      </TouchableOpacity>
    </View>
  );

  const renderAddImage = () => (
    <TouchableOpacity style={styles.addImageContainer} onPress={handleAddImage}>
      <Icon name="add" size={ms(24)} color={colors.primary} />
    </TouchableOpacity>
  );

  const categoryOptions = categories || [];
  const selectedCategory =
    categoryOptions?.find(
      category =>
        category?.value === selectedCategoryValue ||
        category?._id === selectedCategoryValue,
    ) || null;
  const subCategoryOptions = selectedCategory?.subcategoryDatas || [];

  const handleSelectCategory = (category: CategoryItem) => {
    setSelectedCategoryValue(category?.value || category?._id || '');
    setMainCategory(category?.label || '');
    setSubCategory('');
    setIsCategoryModalVisible(false);
  };

  const handleSelectSubCategory = (item: SubcategoryItem) => {
    setSubCategory(item?.label || '');
    setIsSubCategoryModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Loader isLoading={isLoading || isUpdating} />
      <AppHeader
        title={`Lot ${lotNumber || ''} - Details`}
        // subtitle="Step 2 - Additional Information"
        leftIcon="chevron-back"
        onLeftPress={handleBack}
      />

      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}>
        {hasField('Photos') && (
          <View style={styles.section}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.imageRow}>
              {photos?.map((image, index) => renderImage(image, index))}
              {renderAddImage()}
            </ScrollView>
          </View>
        )}

        {(hasField('Lot') ||
          hasField('Inventory') ||
          hasField('Quantity') ||
          hasField('Title') ||
          hasField('Description')) && (
          <View style={styles.section}>
            <AppText
              title="Basic Information"
              fontySize="px14"
              fontFamily="bold"
              color="textPrimary"
              marginBottom={vs(15)}
            />

            {hasField('Lot') && (
              <View style={styles.inputGroup}>
                <AppText title="Lot #" fontySize="px12" color="textPrimary" />
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={lotNumber}
                    onChangeText={setLotNumber}
                  />
                </View>
              </View>
            )}

            {hasField('Inventory') && (
              <View style={styles.inputGroup}>
                <AppText
                  title="Inventory #"
                  fontySize="px12"
                  color="textPrimary"
                />
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={inventoryNumber}
                    onChangeText={setInventoryNumber}
                    placeholder="Enter inventory number..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            )}

            {hasField('Quantity') && (
              <View style={styles.inputGroup}>
                <AppText
                  title="Quantity"
                  fontySize="px12"
                  color="textPrimary"
                />
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="Enter quantity..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            )}

            {hasField('Title') && (
              <View style={styles.inputGroup}>
                <AppText title="Title" fontySize="px12" color="textPrimary" />
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter title..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            )}

            {hasField('Description') && (
              <View style={styles.inputGroup}>
                <AppText
                  title="Description"
                  fontySize="px12"
                  color="textPrimary"
                />
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Enter description..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {(hasField('Start') ||
          hasField('Buy Now') ||
          hasField('Reserve') ||
          hasField('Low Estimate') ||
          hasField('High Estimate')) && (
          <View style={styles.section}>
            <AppText
              title="Pricing Information"
              fontySize="px14"
              fontFamily="bold"
              color="textPrimary"
              marginBottom={vs(15)}
            />

            {(hasField('Start') || hasField('Buy Now')) && (
              <View style={styles.pricingRow}>
                {hasField('Start') && (
                  <View
                    style={[styles.inputGroup, {flex: 1, marginRight: ms(10)}]}>
                    <AppText
                      title="Start Price"
                      fontySize="px12"
                      color="textPrimary"
                    />
                    <View style={styles.inputContainer}>
                      <View style={styles.currencyInput}>
                        <AppText
                          title="$"
                          fontySize="px14"
                          color="textSecondary"
                        />
                        <TextInput
                          style={[
                            styles.textInput,
                            {flex: 1, marginLeft: ms(5)},
                          ]}
                          value={startPrice}
                          onChangeText={setStartPrice}
                          placeholder="0.00"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>
                )}

                {hasField('Buy Now') && (
                  <View
                    style={[styles.inputGroup, {flex: 1, marginLeft: ms(10)}]}>
                    <AppText
                      title="Buy Now"
                      fontySize="px12"
                      color="textPrimary"
                    />
                    <View style={styles.inputContainer}>
                      <View style={styles.currencyInput}>
                        <AppText
                          title="$"
                          fontySize="px14"
                          color="textSecondary"
                        />
                        <TextInput
                          style={[
                            styles.textInput,
                            {flex: 1, marginLeft: ms(5)},
                          ]}
                          value={buyNowPrice}
                          onChangeText={setBuyNowPrice}
                          placeholder="0.00"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}

            {hasField('Reserve') && (
              <View style={styles.inputGroup}>
                <AppText title="Reserve" fontySize="px12" color="textPrimary" />
                <View style={styles.inputContainer}>
                  <View style={styles.currencyInput}>
                    <AppText title="$" fontySize="px14" color="textSecondary" />
                    <TextInput
                      style={[styles.textInput, {flex: 1, marginLeft: ms(5)}]}
                      value={reserve}
                      onChangeText={setReserve}
                      placeholder="0.00"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            )}

            {(hasField('Low Estimate') || hasField('High Estimate')) && (
              <View style={styles.pricingRow}>
                {hasField('Low Estimate') && (
                  <View
                    style={[styles.inputGroup, {flex: 1, marginRight: ms(10)}]}>
                    <AppText
                      title="Low Estimate"
                      fontySize="px12"
                      color="textPrimary"
                    />
                    <View style={styles.inputContainer}>
                      <View style={styles.currencyInput}>
                        <AppText
                          title="$"
                          fontySize="px14"
                          color="textSecondary"
                        />
                        <TextInput
                          style={[
                            styles.textInput,
                            {flex: 1, marginLeft: ms(5)},
                          ]}
                          value={lowEstimate}
                          onChangeText={setLowEstimate}
                          placeholder="0.00"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>
                )}

                {hasField('High Estimate') && (
                  <View
                    style={[styles.inputGroup, {flex: 1, marginLeft: ms(10)}]}>
                    <AppText
                      title="High Estimate"
                      fontySize="px12"
                      color="textPrimary"
                    />
                    <View style={styles.inputContainer}>
                      <View style={styles.currencyInput}>
                        <AppText
                          title="$"
                          fontySize="px14"
                          color="textSecondary"
                        />
                        <TextInput
                          style={[
                            styles.textInput,
                            {flex: 1, marginLeft: ms(5)},
                          ]}
                          value={highEstimate}
                          onChangeText={setHighEstimate}
                          placeholder="0.00"
                          placeholderTextColor="#9CA3AF"
                          keyboardType="numeric"
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {(hasField('Main Category') || hasField('Sub Category')) && (
          <View style={styles.section}>
            <AppText
              title="Category Information"
              fontySize="px14"
              fontFamily="bold"
              color="textPrimary"
              marginBottom={vs(15)}
            />

            {hasField('Main Category') && (
              <View style={styles.inputGroup}>
                <AppText
                  title="Main Category"
                  fontySize="px12"
                  color="textPrimary"
                />
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => setIsCategoryModalVisible(true)}>
                  <View style={styles.dropdownContent}>
                    <AppText
                      title={mainCategory}
                      fontySize="px14"
                      color="textPrimary"
                    />
                    <Icon
                      name="chevron-down-outline"
                      size={ms(16)}
                      color="#6B7280"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {hasField('Sub Category') && (
              <View style={styles.inputGroup}>
                <AppText
                  title="Sub Category"
                  fontySize="px12"
                  color="textPrimary"
                />
                <TouchableOpacity
                  style={styles.inputContainer}
                  onPress={() => {
                    if (subCategoryOptions?.length) {
                      setIsSubCategoryModalVisible(true);
                    } else {
                      setIsCategoryModalVisible(true);
                    }
                  }}>
                  <View style={styles.dropdownContent}>
                    <AppText
                      title={subCategory}
                      fontySize="px14"
                      color="textPrimary"
                    />
                    <Icon
                      name="chevron-down-outline"
                      size={ms(16)}
                      color="#6B7280"
                    />
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {(hasField('Seller') ||
          hasField('Shipping') ||
          hasField('Tax Exempt') ||
          hasField('Not Sold') ||
          hasField('Notes')) && (
          <View style={styles.section}>
            <AppText
              title="Additional Information"
              fontySize="px14"
              fontFamily="bold"
              color="textPrimary"
              marginBottom={vs(15)}
            />

            {hasField('Seller') && (
              <View style={styles.inputGroup}>
                <AppText title="Seller" fontySize="px12" color="textPrimary" />
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={seller}
                    onChangeText={setSeller}
                    placeholder="Enter seller..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            )}

            {hasField('Shipping') && (
              <View style={styles.inputGroup}>
                <AppText
                  title="Shipping"
                  fontySize="px12"
                  color="textPrimary"
                />
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={shipping}
                    onChangeText={setShipping}
                    placeholder="Enter shipping..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            )}

            {hasField('Tax Exempt') && (
              <View style={styles.inputGroup}>
                <AppText
                  title="Tax Exempt"
                  fontySize="px12"
                  color="textPrimary"
                />
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={taxExempt}
                    onChangeText={setTaxExempt}
                    placeholder="Enter tax exempt..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            )}

            {hasField('Not Sold') && (
              <View style={styles.inputGroup}>
                <AppText
                  title="Not Sold"
                  fontySize="px12"
                  color="textPrimary"
                />
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    value={notSold}
                    onChangeText={setNotSold}
                    placeholder="Enter not sold..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            )}

            {hasField('Notes') && (
              <View style={styles.inputGroup}>
                <AppText title="Notes" fontySize="px12" color="textPrimary" />
                <View style={[styles.inputContainer, styles.textAreaContainer]}>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Enter notes..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={4}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {(hasField('Date Added') || hasField('Date Edited')) && (
          <View style={styles.section}>
            <AppText
              title="Audit Information"
              fontySize="px14"
              fontFamily="bold"
              color="textPrimary"
              marginBottom={vs(15)}
            />

            {hasField('Date Added') && (
              <View style={styles.inputGroup}>
                <AppText
                  title="Date Added"
                  fontySize="px12"
                  color="textPrimary"
                />
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.textInput, styles.readOnlyInput]}
                    value={dateAdded}
                    onChangeText={setDateAdded}
                    placeholder="Enter date added..."
                    placeholderTextColor="#9CA3AF"
                    editable={false}
                  />
                </View>
              </View>
            )}

            {hasField('Date Edited') && (
              <View style={styles.inputGroup}>
                <AppText
                  title="Date Edited"
                  fontySize="px12"
                  color="textPrimary"
                />
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.textInput, styles.readOnlyInput]}
                    value={dateEdited}
                    onChangeText={setDateEdited}
                    placeholder="Enter date edited..."
                    placeholderTextColor="#9CA3AF"
                    editable={false}
                  />
                </View>
              </View>
            )}
          </View>
        )}

        {hasField('Complete') && (
          <View style={styles.section}>
            <View style={styles.statusRow}>
              <AppText title="Complete" fontySize="px14" color="textPrimary" />
              <Switch
                value={isComplete}
                onValueChange={setIsComplete}
                trackColor={{false: '#E5E7EB', true: colors.primary}}
                thumbColor={colors.white}
              />
            </View>
            <AppText
              title={isComplete ? 'On' : 'Off'}
              fontySize="px12"
              color="textSecondary"
              textAlign="center"
              marginTop={vs(5)}
            />
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomButtonContainer,
          {paddingBottom: vs(5) + insets.bottom},
        ]}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <AppText title="Save Changes" fontySize="px14" color="white" />
        </TouchableOpacity>
      </View>

      {isCategoryModalVisible && (
        <AppModal
          visible={isCategoryModalVisible}
          onClose={() => setIsCategoryModalVisible(false)}
          position="bottom"
          containerStyle={styles.modalContainer}>
          <AppText
            title="Select Category"
            fontFamily="bold"
            fontySize="px16"
            color="textPrimary"
            marginBottom={vs(12)}
          />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 40}}>
            {categoryOptions?.map(category => (
              <AppPressable
                key={category?._id || category?.value}
                style={[
                  styles.modalOption,
                  selectedCategoryValue === category?.value ||
                  selectedCategoryValue === category?._id
                    ? styles.selectedModalOption
                    : undefined,
                ]}
                onPress={() => handleSelectCategory(category)}>
                <AppText
                  title={category?.label || ''}
                  fontySize="px14"
                  color={
                    selectedCategoryValue === category?.value ||
                    selectedCategoryValue === category?._id
                      ? 'primary'
                      : 'textPrimary'
                  }
                />
              </AppPressable>
            ))}
          </ScrollView>
        </AppModal>
      )}

      {isSubCategoryModalVisible && (
        <AppModal
          visible={isSubCategoryModalVisible}
          onClose={() => setIsSubCategoryModalVisible(false)}
          position="bottom"
          containerStyle={styles.modalContainer}>
          <AppText
            title="Select Sub Category"
            fontFamily="bold"
            fontySize="px16"
            color="textPrimary"
            marginBottom={vs(12)}
          />
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 40}}>
            {subCategoryOptions?.map(item => (
              <AppPressable
                key={item?.value}
                style={[
                  styles.modalOption,
                  subCategory === item?.label
                    ? styles.selectedModalOption
                    : undefined,
                ]}
                onPress={() => handleSelectSubCategory(item)}>
                <AppText
                  title={item?.label || ''}
                  fontySize="px14"
                  color={
                    subCategory === item?.label ? 'primary' : 'textPrimary'
                  }
                />
              </AppPressable>
            ))}
          </ScrollView>
        </AppModal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ms(15),
    paddingTop: vs(50),
    paddingBottom: vs(15),
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  lotNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: ms(15),
    paddingVertical: vs(10),
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    padding: ms(15),
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: ms(15),
    marginBottom: vs(15),
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    width: ms(80),
    height: ms(80),
    marginRight: ms(10),
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  lotImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  deleteImageButton: {
    position: 'absolute',
    top: ms(-1),
    right: ms(-1),
    width: ms(22),
    height: ms(22),
    borderRadius: ms(11),
    backgroundColor: 'rgba(255, 2, 2, 0.93)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageContainer: {
    width: ms(80),
    height: ms(80),
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputGroup: {
    marginBottom: vs(15),
  },
  inputContainer: {
    marginTop: vs(6),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  textInput: {
    paddingHorizontal: ms(12),
    paddingVertical: vs(10),
    fontSize: ms(14),
    color: colors.textPrimary,
    backgroundColor: colors.white,
  },
  readOnlyInput: {
    backgroundColor: '#F3F4F6',
  },
  textAreaContainer: {
    height: vs(100),
  },
  textArea: {
    height: vs(100),
    textAlignVertical: 'top',
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(12),
    paddingVertical: vs(10),
    backgroundColor: colors.white,
  },
  pricingRow: {
    flexDirection: 'row',
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(12),
    paddingVertical: vs(10),
    backgroundColor: colors.white,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomButtonContainer: {
    backgroundColor: colors.white,
    paddingHorizontal: ms(15),
    paddingTop: vs(10),
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: vs(12),
    borderRadius: 6,
    alignItems: 'center',
  },
  modalContainer: {
    maxHeight: vs(420),
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  modalOption: {
    paddingVertical: vs(14),
    paddingHorizontal: ms(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedModalOption: {
    backgroundColor: colors.light100,
    borderRadius: 8,
  },
});

export default LotDetailsScreen;
