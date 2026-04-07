import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Ionicons';
import { AppText } from '../../../components/AppText';
import AppButton from '../../../components/appButton';
import { colors } from '../../../constants';
import { ms, vs } from '../../../utils/responsive';
import { routes } from '../../../navigation/route';
import { ValidationSchemas } from '../../../helper/validation';
import { Formik, FormikProps } from 'formik';
import { AppInput } from '../../../components/AppInput';
import AppHeader from '../../../components/appHeader';

interface FormValues {
  lotNumber: string;
  title: string;
  description: string;
  quantity: string;
  startPrice: string;
  buyNowPrice: string;
  reserve: string;
}

const AddNewLotScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { addNewLotValidation } = ValidationSchemas();
  const formikRef = useRef<FormikProps<FormValues>>(null);

  const handleSubmit = (values: FormValues) => {
    // Formik will only call this when all validations pass
    navigation.navigate(routes.lotImagesScreen);
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const onNextPress = () => {
    if (formikRef.current) {
      formikRef.current.handleSubmit();
    }
  };

  return (
    <View style={styles.container}>
      {/* App Header */}
      <AppHeader
        title="Add New Lot"
        subtitle="Step 1 - Basic Info"
        leftIcon="chevron-back"
        onLeftPress={handleCancel}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={20}
      >
        <Formik
          innerRef={formikRef}
          initialValues={{
            lotNumber: '209',
            title: '',
            description: '',
            quantity: '1',
            startPrice: '',
            buyNowPrice: '',
            reserve: '',
          }}
          validationSchema={addNewLotValidation}
          onSubmit={handleSubmit}
        >
          {({
            handleChange,
            handleBlur,
            values,
            errors,
            touched,
          }: FormikProps<FormValues>) => (
            <View style={styles.formContainer}>
              <View style={styles.contentArea}>
                <View style={styles.formSection}>
                  {/* Removed duplicate Step title because AppHeader already shows it */}
                  {/* Lot Number */}
                  <View style={styles.inputGroup}>
                    <AppInput
                      value={values.lotNumber}
                      onChangeText={handleChange('lotNumber')}
                      onBlur={handleBlur('lotNumber')}
                      placeholder="Enter lot number"
                      keyboardType="numeric"
                      error={touched.lotNumber && errors.lotNumber ? errors.lotNumber : ''}
                      label='Lot Number'
                    />
                  </View>

                  {/* Title */}
                  <View style={styles.inputGroup}>
                    <AppInput
                      value={values.title}
                      onChangeText={handleChange('title')}
                      onBlur={handleBlur('title')}
                      placeholder="Enter lot title"
                      error={touched.title && errors.title ? errors.title : ''}
                        label='Title'
                    />
                  </View>

                  {/* Description */}
                  <View style={styles.inputGroup}>
                    <AppInput
                      value={values.description}
                      onChangeText={handleChange('description')}
                      onBlur={handleBlur('description')}
                      placeholder="Enter description (optional)"
                      multiline
                      numberOfLines={3}
                      error={touched.description && errors.description ? errors.description : ''}
                       label='Description'
                    />
                  </View>

                  {/* Quantity */}
                  <View style={styles.inputGroup}>
                    <AppInput
                      value={values.quantity}
                      onChangeText={handleChange('quantity')}
                      onBlur={handleBlur('quantity')}
                      placeholder="Enter quantity"
                      keyboardType="numeric"
                      error={touched.quantity && errors.quantity ? errors.quantity : ''}
                        label='Quantity'
                    />
                  </View>

                  {/* Start Price */}
                  <View style={styles.inputGroup}>
                    <AppInput
                      value={values.startPrice}
                      onChangeText={handleChange('startPrice')}
                      onBlur={handleBlur('startPrice')}
                      placeholder="Enter start price"
                      keyboardType="numeric"
                      error={touched.startPrice && errors.startPrice ? errors.startPrice : ''}
                       label='Start Price $'
                    />
                  </View>

                  {/* Buy Now Price */}
                  <View style={styles.inputGroup}>
                    <AppInput
                      value={values.buyNowPrice}
                      onChangeText={handleChange('buyNowPrice')}
                      onBlur={handleBlur('buyNowPrice')}
                      placeholder="Enter buy now price (optional)"
                      keyboardType="numeric"
                      error={touched.buyNowPrice && errors.buyNowPrice ? errors.buyNowPrice : ''}
                      label='Buy Now Price $'
                    />
                  </View>

                  {/* Reserve Price */}
                  <View style={styles.inputGroup}>
                    <AppInput
                      value={values.reserve}
                      onChangeText={handleChange('reserve')}
                      onBlur={handleBlur('reserve')}
                      placeholder="Enter reserve price (optional)"
                      keyboardType="numeric"
                      error={touched.reserve && errors.reserve ? errors.reserve : ''}
                      label='Reserve Price $'
                    />
                  </View>
                </View>
              </View>
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>

      {/* Bottom Buttons - Fixed at bottom with safe area */}
      <View style={[styles.bottomButtons, { paddingBottom: vs(5) + insets.bottom }]}>
        <AppButton
          title="Cancel"
          onPress={handleCancel}
          style={styles.cancelBtn}
          textColor="textSecondary"
          bgColor="white"
          borderColor="border"
          transparent={false}
        />
        <AppButton
          title="Next"
          onPress={onNextPress}
          style={styles.nextBtn}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
  },
  contentArea: {
    padding: ms(15),
  },
  formSection: {
    // 
    // padding: ms(15),
    borderRadius: 8,
    marginBottom: vs(15),
  },
  inputGroup: {
    // marginBottom: vs(15),
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: ms(15),
    paddingTop: vs(15),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(10),
  },
  nextBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: ms(10)
  },
  buttonTextStyle:{
    fontSize:ms(16)
  }
});

export default AddNewLotScreen;