import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../components/AppText';

import { colors } from '../../../constants';
import { ms, vs } from '../../../utils/responsive';
import { routes } from '../../../navigation/route';
import { validateLotForm, validatePriceRelationships } from '../../../utils/validation';
import AppHeader from '../../../components/appHeader';

const LotDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { lot } = route.params || {};

  
  const [lotNumber, setLotNumber] = useState(lot?.lotNumber || '205');
  const [inventoryNumber, setInventoryNumber] = useState('');
  const [title, setTitle] = useState(
    'Young Electric 20 in, E-Flow Off-Road/Fat Tire Fol...',
  );
  const [description, setDescription] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [buyNowPrice, setBuyNowPrice] = useState('');
  const [reserve, setReserve] = useState('');
  const [lowEstimate, setLowEstimate] = useState('');
  const [highEstimate, setHighEstimate] = useState('');
  const [mainCategory, setMainCategory] = useState('Art');
  const [subCategory, setSubCategory] = useState('Paintings');
  const [isComplete, setIsComplete] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleSave = () => {
    const formData = {
      lotNumber,
      title,
      description,
      quantity: '1', // Default quantity for details screen
      startPrice,
      buyNowPrice,
      reserve,
    };

    const validation = validateLotForm(formData);
    if (!validation.isValid) {
      Alert.alert('Validation Error', validation.error);
      return;
    }

    // TODO: Implement save functionality
    Alert.alert('Success', 'Lot details saved successfully');
    navigation.goBack();
  };

  const mockImages = [
    {id: '1', uri: null},
    {id: '2', uri: null},
    {id: '3', uri: null},
  ];

  const renderImage = (image: any, index: number) => (
    <View key={image.id} style={styles.imageContainer}>
      <View style={styles.imagePlaceholder}>
        <Icon name="bicycle-outline" size={ms(24)} color="#9CA3AF" />
      </View>
    </View>
  );

  const renderAddImage = () => (
    <TouchableOpacity style={styles.addImageContainer}>
      <Icon name="add" size={ms(24)} color={colors.primary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* App Header */}
      <AppHeader
        title="Lot 205 - Details"
        subtitle="Step 2 - Additional Information"
        leftIcon="chevron-back"
        onLeftPress={handleBack}
      />

      <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
        {/* Images Section */}
        <View style={styles.section}>
          <View style={styles.imageRow}>
            {mockImages.map((image, index) => renderImage(image, index))}
            {renderAddImage()}
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <AppText
            title="Basic Information"
            fontySize="px14"
            fontFamily="bold"
            color="textPrimary"
            marginBottom={vs(15)}
          />

          {/* Lot Number */}
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

          {/* Inventory Number */}
          <View style={styles.inputGroup}>
            <AppText title="Inventory #" fontySize="px12" color="textPrimary" />
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

          {/* Title */}
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

          {/* Description */}
          <View style={styles.inputGroup}>
            <AppText title="Description" fontySize="px12" color="textPrimary" />
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
        </View>

        {/* Pricing Information */}
        <View style={styles.section}>
          <AppText
            title="Pricing Information"
            fontySize="px14"
            fontFamily="bold"
            color="textPrimary"
            marginBottom={vs(15)}
          />

          <View style={styles.pricingRow}>
            {/* Start Price */}
            <View style={[styles.inputGroup, {flex: 1, marginRight: ms(10)}]}>
              <AppText title="Start Price" fontySize="px12" color="textPrimary" />
              <View style={styles.inputContainer}>
                <View style={styles.currencyInput}>
                  <AppText title="$" fontySize="px14" color="textSecondary" />
                  <TextInput
                    style={[styles.textInput, {flex: 1, marginLeft: ms(5)}]}
                    value={startPrice}
                    onChangeText={setStartPrice}
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Buy Now */}
            <View style={[styles.inputGroup, {flex: 1, marginLeft: ms(10)}]}>
              <AppText title="Buy Now" fontySize="px12" color="textPrimary" />
              <View style={styles.inputContainer}>
                <View style={styles.currencyInput}>
                  <AppText title="$" fontySize="px14" color="textSecondary" />
                  <TextInput
                    style={[styles.textInput, {flex: 1, marginLeft: ms(5)}]}
                    value={buyNowPrice}
                    onChangeText={setBuyNowPrice}
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Reserve */}
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

          {/* Estimates */}
          <View style={styles.pricingRow}>
            {/* Low Estimate */}
            <View style={[styles.inputGroup, {flex: 1, marginRight: ms(10)}]}>
              <AppText title="Low Estimate" fontySize="px12" color="textPrimary" />
              <View style={styles.inputContainer}>
                <View style={styles.currencyInput}>
                  <AppText title="$" fontySize="px14" color="textSecondary" />
                  <TextInput
                    style={[styles.textInput, {flex: 1, marginLeft: ms(5)}]}
                    value={lowEstimate}
                    onChangeText={setLowEstimate}
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* High Estimate */}
            <View style={[styles.inputGroup, {flex: 1, marginLeft: ms(10)}]}>
              <AppText title="High Estimate" fontySize="px12" color="textPrimary" />
              <View style={styles.inputContainer}>
                <View style={styles.currencyInput}>
                  <AppText title="$" fontySize="px14" color="textSecondary" />
                  <TextInput
                    style={[styles.textInput, {flex: 1, marginLeft: ms(5)}]}
                    value={highEstimate}
                    onChangeText={setHighEstimate}
                    placeholder="0.00"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Category Information */}
        <View style={styles.section}>
          <AppText
            title="Category Information"
            fontySize="px14"
            fontFamily="bold"
            color="textPrimary"
            marginBottom={vs(15)}
          />

          {/* Main Category */}
          <View style={styles.inputGroup}>
            <AppText title="Main Category" fontySize="px12" color="textPrimary" />
            <TouchableOpacity style={styles.inputContainer}>
              <View style={styles.dropdownContent}>
                <AppText title={mainCategory} fontySize="px14" color="textPrimary" />
                <Icon name="chevron-down-outline" size={ms(16)} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Sub Category */}
          <View style={styles.inputGroup}>
            <AppText title="Sub Category" fontySize="px12" color="textPrimary" />
            <TouchableOpacity style={styles.inputContainer}>
              <View style={styles.dropdownContent}>
                <AppText title={subCategory} fontySize="px14" color="textPrimary" />
                <Icon name="chevron-down-outline" size={ms(16)} color="#6B7280" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status */}
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

      </ScrollView>

      {/* Bottom Button - Fixed at bottom with safe area */}
      <View style={[styles.bottomButtonContainer, { paddingBottom: vs(5) + insets.bottom }]}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <AppText title="Save Changes" fontySize="px14" color="white" />
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
  },
  imageContainer: {
    width: ms(80),
    height: ms(80),
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
});

export default LotDetailsScreen;
