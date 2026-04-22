import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Keyboard,
} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import AppButton from '../../../components/appButton';
import {colors} from '../../../constants';
import {ms, vs} from '../../../utils/responsive';
import {routes} from '../../../navigation/route';
import {Formik, FormikProps} from 'formik';
import {AppInput} from '../../../components/AppInput';
import AppHeader from '../../../components/appHeader';
import {useGetCatalogFields} from '../../../services/queries/app/catlog/getCatalogFields';
import {AppText} from '../../../components/AppText';
import Icon from 'react-native-vector-icons/Ionicons';
import AppModal from '../../../components/AppModal';
import AppPressable from '../../../components/appPressable';
import AppToast from '../../../components/toaster';
import Loader from '../../../components/loader';
interface CatalogField {
  _id: string;
  label: string;
  type: string;
  choices: string[] | string;
  defaultValue: string;
}

const AddNewLotScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const formikRef = useRef<FormikProps<Record<string, string>>>(null);
  const sale = route.params?.sale;

  
  const {data: catalogFieldsData, isPending} = useGetCatalogFields({
    templateId: String(sale?.saleId || ''),
  });
  const dynamicFields: CatalogField[] = (catalogFieldsData?.data || []).filter(
    (field: CatalogField) =>
      (field?.type === 'text' || field?.type === 'textarea') &&
      field?.label !== 'Date Added' &&
      field?.label !== 'Date Edited',
  );
  const initialValues = dynamicFields.reduce<Record<string, string>>(
    (acc, field) => {
      acc[field.label] = field?.defaultValue || '';
      return acc;
    },
    {},
  );
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryValue, setSelectedCategoryValue] = useState('');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isSubCategoryModalVisible, setIsSubCategoryModalVisible] =
    useState(false);
  const [mainCategory, setMainCategory] = useState('Select');
  const [subCategory, setSubCategory] = useState('Select');

useFocusEffect(
  useCallback(() => {
    return () => {

      formikRef.current?.resetForm();

      setSelectedCategoryValue('');
      setMainCategory('Select');
      setSubCategory('Select');

      // close modals
      setIsCategoryModalVisible(false);
      setIsSubCategoryModalVisible(false);
    };
  }, []),
);



  useEffect(() => {
    if (catalogFieldsData?.categories) {
      setCategories(catalogFieldsData.categories);
    }
  }, [catalogFieldsData]);

  const categoryOptions = categories || [];

  const selectedCategory =
    categoryOptions.find(
      item =>
        item?.value === selectedCategoryValue ||
        item?._id === selectedCategoryValue,
    ) || null;

  const subCategoryOptions = selectedCategory?.subcategoryDatas || [];

 const handleSelectCategory = (category: any) => {
  const id = category?._id || category?.value || '';

  const categoryObj = {
    label: 'Main Category',
    id: id,
    value: category?.label || '',
  };

  setSelectedCategoryValue(id);
  setMainCategory(category?.label || 'Select');

  // ✅ store object (NOT string)
  formikRef.current?.setFieldValue('Main Category', categoryObj);

  // reset subcategory
  setSubCategory('Select');
  formikRef.current?.setFieldValue('Sub Category', '');

  setIsCategoryModalVisible(false);
};

const handleSelectSubCategory = (item: any) => {
  const subCategoryObj = {
    label: 'Sub Category',
    id: item?._id || item?.value || '',
    value: item?.label || '',
  };

  setSubCategory(item?.label || 'Select');

  // ✅ store object
  formikRef.current?.setFieldValue('Sub Category', subCategoryObj);

  setIsSubCategoryModalVisible(false);
};

  const handleSubmit = (values: Record<string, string>) => {
    const finalData = {
      ...values,
      'Main Category': mainCategory,
      'Sub Category': subCategory,
    };



    navigation.navigate(routes.lotImagesScreen, {
      data: finalData,
      sale: sale,

    });
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const onNextPress = () => {
    if (formikRef.current) {
      formikRef.current.validateForm().then(errors => {
        if (!selectedCategoryValue) {
          AppToast.error('Main Category is required');
          return;
        }

        if (!subCategory || subCategory === 'Select') {
          AppToast.error('Sub Category is required');
          return;
        }

        if (Object.keys(errors).length > 0) {
          const firstError = Object.values(errors)[0];
          AppToast.error(firstError as string);
          return;
        }

        formikRef.current?.handleSubmit();
      });
    }
  };

  const validateForm = (values: Record<string, string>) => {
    const errors: Record<string, string> = {};

    dynamicFields.forEach(field => {
      if (!values[field.label] || values[field.label].trim() === '') {
        errors[field.label] = `${field.label} is required`;
      }
    });

    return errors;
  };

  return (
    <View style={styles.container}>
      <Loader isLoading={isPending} />
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
        enableResetScrollToCoords={false}>
        <Formik
          enableReinitialize
          innerRef={formikRef}
          initialValues={initialValues}
          validate={validateForm}
          onSubmit={handleSubmit}>
          {({
            handleChange,
            handleBlur,
            values,
            touched,
            errors,
          }: FormikProps<Record<string, string>>) => (
            <View style={styles.formContainer}>
              <View style={styles.contentArea}>
                <View style={styles.formSection}>
                  {dynamicFields?.map(field => {
                    const isNumberField = [
                      'Quantity',
                      'Lot',
                      'Start',
                      'Buy Now',
                      'Low Estimate',
                      'High Estimate',
                      'Reserve',
                    ].includes(field.label);

                    return (
                      <View style={styles.inputGroup} key={field._id}>
                        <AppInput
                          value={values[field.label] || ''}
                          onChangeText={(text: string) => {
                            // allow only numbers
                            if (isNumberField) {
                              const cleaned = text.replace(/[^0-9]/g, '');
                              handleChange(field.label)(cleaned);
                            } else {
                              handleChange(field.label)(text);
                            }
                          }}
                          onBlur={handleBlur(field.label)}
                          placeholder={`Enter ${field.label.toLowerCase()}`}
                          label={field.label}
                          multiline={field.type === 'textarea'}
                          numberOfLines={field.type === 'textarea' ? 4 : 1}
                          keyboardType={isNumberField ? 'number-pad' : 'default'}
                          style={
                            field.type === 'textarea'
                              ? styles.textAreaInput
                              : undefined
                          }
                          error={
                            touched[field.label] && errors[field.label]
                              ? errors[field.label]
                              : undefined
                          }
                          maxLength={250}
                        />
                      </View>
                    );
                  })}
                </View>
                <View style={[styles.inputGroup, {marginBottom: 10}]}>
                  <AppText
                    title="Main Category"
                    fontySize="px12"
                    color="textPrimary"
                  />
                  <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={() => {
                      Keyboard.dismiss()
                      setIsCategoryModalVisible(true)}}>
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
                <View style={[styles.inputGroup, {marginBottom: 20}]}>
                  <AppText
                    title="Sub Category"
                    fontySize="px12"
                    color="textPrimary"
                  />
                  <TouchableOpacity
                    style={styles.inputContainer}
                    onPress={() => {
                       Keyboard.dismiss()
                      if (!selectedCategoryValue) {
                        AppToast.error('Select Category first');
                        return;
                      }

                      setIsSubCategoryModalVisible(true);
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
              </View>
            </View>
          )}
        </Formik>
      </KeyboardAwareScrollView>

      {/* Bottom Buttons - Fixed at bottom with safe area */}
      <View
        style={[styles.bottomButtons, {paddingBottom: vs(5) + insets.bottom}]}>
        <AppButton
          title="Cancel"
          onPress={handleCancel}
          style={styles.cancelBtn}
          textColor="textSecondary"
          bgColor="white"
          borderColor="border"
          transparent={false}
        />
        <AppButton title="Next" onPress={onNextPress} style={styles.nextBtn} />
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
            {subCategoryOptions?.map((item: any) => (
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
  textAreaInput: {
    minHeight: vs(90),
    textAlignVertical: 'top',
    paddingTop: vs(12),
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
    marginLeft: ms(10),
  },
  buttonTextStyle: {
    fontSize: ms(16),
  },
  inputContainer: {
    marginTop: vs(6),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: ms(12),
    paddingVertical: vs(10),
    backgroundColor: colors.white,
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

export default AddNewLotScreen;
