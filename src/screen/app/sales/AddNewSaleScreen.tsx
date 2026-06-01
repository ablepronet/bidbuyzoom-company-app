import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
  Image,
  Alert,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFormik } from 'formik';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { pick, types } from '@react-native-documents/picker';
import { City, State } from 'country-state-city';
import moment from 'moment-timezone';
import AppHeader from '../../../components/appHeader';
import { AppText } from '../../../components/AppText';
import Loader from '../../../components/loader';
import { colors, IMAGE_BASE_URL } from '../../../constants';
import { ms, scale, vs } from '../../../utils/responsive';
import GooglePlaceAutoComplete, {
  GooglePlaceResult,
} from '../../../components/GooglePlaceAutoComplete';
import {
  SaleTypeItem,
  useGetSaleTypes,
} from '../../../services/queries/app/sales/useGetSaleTypes';
import {
  CategoryItem,
  useGetCategories,
} from '../../../services/queries/app/sales/useGetCategories';
import {
  SalesListingItem,
  useGetSalesListing,
} from '../../../services/queries/app/sales/useGetSalesListing';
import {
  useAddSaleImages,
  useAddSaleInformation,
} from '../../../services/queries/app/sales/useAddSaleFlow';
import { showImagePickerAlert, validateImage, takePhotoWithCamera } from '../../../utils/imagePicker';
import { ValidationSchemas } from '../../../helper/validation';
import AppToast from '../../../components/toaster';
import {
  CheckboxRow,
  DateTimeField,
  ErrorText,
  FieldLabel,
  RadioRow,
  SelectField,
  TextInputField,
} from '../../../components/form/FormFields';
import {
  DateMode,
  FormState,
  PickerConfig,
  PickerMode,
  SaleDateRow,
  SelectedFile,
  Step,
  dateModeOptions,
  timeZoneLabelMap,
} from './addNewSaleTypes';
import { styles } from './styles';
import { useGetUserProfile } from '../../../services/queries/app/Profile';
import { routes } from '../../../navigation/route';

const formatGmtOffset = (zoneName: string) =>
  moment
    .tz(zoneName)
    .format('Z')
    .replace(/^([+-])0/, '$1');

const getTimeZoneOptions = () =>
  Object.entries(timeZoneLabelMap).map(
    ([zoneName, label]) => `(GMT${formatGmtOffset(zoneName)}) ${label}`,
  );
const timeZoneOptions = getTimeZoneOptions();
const timeZoneOptionToZone = Object.fromEntries(
  Object.entries(timeZoneLabelMap).map(([zoneName, label]) => [
    `(GMT${formatGmtOffset(zoneName)}) ${label}`,
    zoneName === 'Asia/Kolkata' ? 'Asia/Calcutta' : zoneName,
  ]),
);

const normalizeZoneName = (zoneName?: string) =>
  zoneName === 'Asia/Calcutta' ? 'Asia/Kolkata' : zoneName || '';

const getTimeZoneOptionFromValue = (value?: string) => {
  if (!value) return timeZoneOptions[0];

  let zoneName = value;
  try {
    const parsed = JSON.parse(value);
    zoneName = parsed?.value || value;
  } catch { }

  const normalizedZone = normalizeZoneName(zoneName);
  return (
    (Object.entries(timeZoneLabelMap).find(
      ([key]) => normalizeZoneName(key) === normalizedZone,
    )?.[1] &&
      `(GMT${formatGmtOffset(normalizedZone)}) ${timeZoneLabelMap[normalizedZone]
      }`) ||
    timeZoneOptions[0]
  );
};

const getDateModeFromSaleTypeCheck = (value?: string): DateMode => {
  const map: Record<string, DateMode> = {
    single: 'One day sale',
    multiple: 'Multiple day sale',
    start_end: 'Start date / End date',
    date_announcement: 'Date to be announced',
    online_only: 'One Day Online Only Sale',
  };

  return map[value || ''] || 'One day sale';
};

const formatSaleDate = (date?: string) =>
  date ? moment(date).format('DD/MM/YYYY') : '';

const formatSaleTime = (time?: string) =>
  time ? moment(time, ['HH:mm', 'hh:mm A']).format('hh:mm A') : '12:00 AM';

const initialForm: FormState = {
  sale: '',
  businessName: '',
  title: '',
  saleType: '',
  categories: [],
  shortDescription: '',
  fullDescription: '',
  dateMode: 'One day sale',
  saleDate: '',
  startTime: '12:00 AM',
  endTime: '12:00 AM',
  userTimeZone: timeZoneOptions[0],
  saleTimeZone: timeZoneOptions[0],
  uploadTitle: '',
  sameAsCompanyAddress: false,
  address: '',
  state: '',
  city: '',
  zipCode: '',
};

const AddNewSaleScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const editSale = route.params?.selectedSale;
  const editSaleId = route.params?.saleId || editSale?._id || editSale?.saleId;
  const isEditMode = route.params?.mode === 'edit' && Boolean(editSale);
  const { addNewSaleValidation } = ValidationSchemas();
  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfile();
  const profile = profileData?.datas;
  const companySlug = profileData?.datas?.companySlug || '';
  const addSaleInformationMutation = useAddSaleInformation();
  const addSaleImagesMutation = useAddSaleImages();
  const [step, setStep] = useState<Step>(1);
  const formik = useFormik<FormState>({
    initialValues: initialForm,
    validationSchema: addNewSaleValidation,
    validateOnBlur: false,
    validateOnChange: false,
    onSubmit: () => {
      if (step < 3) {
        setStep(prev => (prev + 1) as Step);
      }
    },
  });
  const {
    values: form,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    setTouched,
    validateForm,
    resetForm,
    setValues,
  } = formik;

  useEffect(() => {
    if (companySlug && form.businessName !== companySlug) {
      setFieldValue('businessName', companySlug, false);
      setFieldTouched('businessName', false, false);
    }
  }, [companySlug, form.businessName, setFieldTouched, setFieldValue]);

  console.log('form', form);


  useEffect(() => {
    if (!isEditMode || !editSale) return;

    const dateMode = getDateModeFromSaleTypeCheck(editSale.slaeTypeTimeCheck);
    const dates = editSale.multiStartDate || [];
    const firstDate = dates[0] || {};
    const secondDate = dates[1] || {};
    const categoryIds = editSale.categoryIds?.length
      ? editSale.categoryIds
      : editSale.category?.map((item: any) => item?._id).filter(Boolean) || [];

    setStep(1);
    setSelectConfig(null);
    const existingImages: SelectedFile[] = [];
    const rawImages = editSale.images || editSale.Photos || editSale.photos || editSale.saleImages || editSale.media || [];

    if (Array.isArray(rawImages)) {
      rawImages.forEach((img: any, index: number) => {
        if (!img) return;

        let imgUri = '';
        let name = '';

        if (typeof img === 'string') {
          imgUri = img;
          name = img.split('/').pop() || `image-${index}.jpg`;
        } else if (typeof img === 'object') {
          imgUri = img.uri || img.path || img.url || '';
          name = img.name || img.filename || imgUri.split('/').pop() || `image-${index}.jpg`;
        }

        if (imgUri) {
          const isAbsolute = imgUri.startsWith('http') || imgUri.startsWith('file://') || imgUri.startsWith('content://');
          const absoluteUri = isAbsolute ? imgUri : `${IMAGE_BASE_URL}${imgUri}`;

          existingImages.push({
            uri: absoluteUri,
            name: name,
            isExisting: true,
            originalPath: imgUri,
          } as any);
        }
      });
    }

    setImages(existingImages);
    setRemovedImages([]);
    setUploadFiles([]);
    setDateSectionError('');
    setSaleDateRows([
      { id: '1', date: '', startTime: '12:00 AM', endTime: '12:00 AM' },
    ]);
    setRangeDates({
      startDate: '',
      endDate: '',
      startTime: '12:00 AM',
      endTime: '12:00 AM',
    });
    setOnlineDates({
      startDate: '',
      endDate: '',
    });
    setCreatedSaleId(editSaleId || '');
    setValues(
      {
        ...initialForm,
        sale: editSale.title || '',
        businessName: companySlug || editSale.companySlug || '',
        title: editSale.title || '',
        saleType: editSale.saleType || '',
        categories: categoryIds,
        shortDescription: editSale.shortDescription || '',
        fullDescription: editSale.fullDescription || '',
        dateMode,
        saleDate: formatSaleDate(firstDate.startDate),
        startTime: formatSaleTime(firstDate.startTime),
        endTime: formatSaleTime(firstDate.endTime),
        userTimeZone: getTimeZoneOptionFromValue(editSale.currentTimeZone),
        saleTimeZone: getTimeZoneOptionFromValue(editSale.saleTimeZone),
        uploadTitle: editSale.fileTitle || '',
        sameAsCompanyAddress: Boolean(editSale.isSameAddress),
        address: editSale.address || '',
        state: editSale.state || '',
        city: editSale.city || '',
        zipCode: editSale.zipCode || '',
      },
      false,
    );

    if (dateMode === 'Multiple day sale' && dates.length) {
      setSaleDateRows(
        dates.map((item: any, index: number) => ({
          id: item._id || String(index + 1),
          date: formatSaleDate(item.startDate),
          startTime: formatSaleTime(item.startTime),
          endTime: formatSaleTime(item.endTime),
        })),
      );
    }

    if (dateMode === 'Start date / End date') {
      setRangeDates({
        startDate: formatSaleDate(firstDate.startDate),
        endDate: formatSaleDate(secondDate.startDate),
        startTime: formatSaleTime(firstDate.startTime),
        endTime: formatSaleTime(secondDate.startTime || secondDate.endTime),
      });
    }

    if (dateMode === 'One Day Online Only Sale') {
      setOnlineDates({
        startDate: formatSaleDate(firstDate.startDate),
        endDate: formatSaleDate(secondDate.startDate),
      });
    }
  }, [companySlug, editSale, editSaleId, isEditMode, setValues]);
  const [selectConfig, setSelectConfig] = useState<{
    key: keyof FormState;
    title: string;
    options: string[];
  } | null>(null);
  const [pickerConfig, setPickerConfig] = useState<PickerConfig | null>(null);
  const [pickerValue, setPickerValue] = useState(new Date());
  const [images, setImages] = useState<SelectedFile[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [uploadFiles, setUploadFiles] = useState<SelectedFile[]>([]);
  const [createdSaleId, setCreatedSaleId] = useState('');
  const [dateSectionError, setDateSectionError] = useState('');
  const [saleDateRows, setSaleDateRows] = useState<SaleDateRow[]>([
    { id: '1', date: '', startTime: '12:00 AM', endTime: '12:00 AM' },
  ]);
  const [rangeDates, setRangeDates] = useState({
    startDate: '',
    endDate: '',
    startTime: '12:00 AM',
    endTime: '12:00 AM',
  });
  const [onlineDates, setOnlineDates] = useState({
    startDate: '',
    endDate: '',
  });
  const {
    data: salesListingData,
    isLoading: isSalesListingLoading,
    isError: isSalesListingError,
  } = useGetSalesListing();
  const {
    data: saleTypesData,
    isLoading: isSaleTypesLoading,
    isError: isSaleTypesError,
  } = useGetSaleTypes();
  const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
  } = useGetCategories();

  const saleOptions = useMemo(() => {
    const sales = salesListingData?.data || [];

    return sales
      .filter((item: SalesListingItem) => item?.title)
      .map((item: SalesListingItem) => item.title);
  }, [salesListingData?.data]);
  const selectedListingSale = useMemo(() => {
    if (!isEditMode) return null;

    const sales = salesListingData?.data || [];
    const selectedSaleTitle = form.sale.trim().toLowerCase();

    return sales.find(
      (item: SalesListingItem) =>
        item.title?.trim().toLowerCase() === selectedSaleTitle,
    );
  }, [form.sale, isEditMode, salesListingData?.data]);
  const selectedListingSaleId =
    (isEditMode
      ? editSaleId || selectedListingSale?._id || selectedListingSale?.saleId
      : createdSaleId) || '';

  const saleTypeOptions = useMemo(() => {
    const saleTypes = saleTypesData?.datas || [];

    return saleTypes
      .filter((item: SaleTypeItem) => item?.name && item?.isDeleted !== true)
      .sort(
        (a: SaleTypeItem, b: SaleTypeItem) =>
          Number(a?.sequence ?? 0) - Number(b?.sequence ?? 0),
      )
      .map((item: SaleTypeItem) => item.name);
  }, [saleTypesData?.datas]);

  const categoryOptions = useMemo(() => {
    const categories = categoriesData?.data || [];
    console.log('categoriesData', categoriesData);

    return categories.filter(
      (item: CategoryItem) =>
        item?._id &&
        item?.name &&
        item?.isDeleted !== true &&
        item?.isActive !== false &&
        item?.isSaleStatus !== false,
    );
  }, [categoriesData?.data]);

  const categoryNameById = useMemo(
    () =>
      Object.fromEntries(
        categoryOptions.map((item: CategoryItem) => [item._id, item.name]),
      ),
    [categoryOptions],
  );

  const selectedCategoriesText = useMemo(
    () =>
      form.categories
        .map(categoryId => categoryNameById[categoryId] || categoryId)
        .join(', ') || 'No categories selected',
    [categoryNameById, form.categories],
  );
  const usStates = useMemo(() => State.getStatesOfCountry('US'), []);
  const stateOptions = useMemo(
    () => usStates.map(state => state.name),
    [usStates],
  );
  const selectedStateIsoCode = useMemo(
    () => usStates.find(state => state.name === form.state)?.isoCode || '',
    [form.state, usStates],
  );
  const availableCities = useMemo(
    () =>
      selectedStateIsoCode
        ? City.getCitiesOfState('US', selectedStateIsoCode).map(
          city => city.name,
        )
        : [],
    [selectedStateIsoCode],
  );
  const stateSelectOptions = useMemo(() => {
    const values = [...stateOptions];
    if (form.state && !values.includes(form.state)) values.unshift(form.state);
    return values;
  }, [form.state, stateOptions]);
  const citySelectOptions = useMemo(() => {
    const values = [...availableCities];
    if (form.city && !values.includes(form.city)) values.unshift(form.city);
    return values;
  }, [availableCities, form.city]);

  const updateField = (key: keyof FormState, value: string | boolean) => {
    if (key === 'sale') {
      setCreatedSaleId('');
    }
    setFieldValue(key, value, false);
    setFieldTouched(key, false, false);
  };

  const toggleCategory = (categoryId: string) => {
    const nextCategories = form.categories.includes(categoryId)
      ? form.categories.filter(item => item !== categoryId)
      : [...form.categories, categoryId];

    setFieldValue('categories', nextCategories, false);
    setFieldTouched('categories', true, false);
  };

  const getFieldError = (key: keyof FormState) =>
    touched[key] && errors[key] ? String(errors[key]) : undefined;

  const getCategoryError = () =>
    touched.categories && errors.categories
      ? String(errors.categories)
      : undefined;

  const validateDateSection = () => {
    let nextDateError = '';

    if (
      form.dateMode === 'Multiple day sale' &&
      saleDateRows.some(row => !row.date.trim())
    ) {
      nextDateError = 'Please add date for each sale date row';
    }
    if (
      form.dateMode === 'Start date / End date' &&
      (!rangeDates.startDate.trim() || !rangeDates.endDate.trim())
    ) {
      nextDateError = 'Start date and end date are required';
    }
    if (
      form.dateMode === 'One Day Online Only Sale' &&
      (!onlineDates.startDate.trim() || !onlineDates.endDate.trim())
    ) {
      nextDateError = 'Start date and end date are required';
    }

    setDateSectionError(nextDateError);
    return !nextDateError;
  };

  const markInformationTouched = () => {
    setTouched(
      {
        sale: isEditMode,
        businessName: true,
        title: true,
        saleType: true,
        categories: true,
        shortDescription: true,
        fullDescription: true,
        dateMode: true,
        saleDate: true,
        startTime: true,
        endTime: true,
        userTimeZone: true,
        saleTimeZone: true,
        uploadTitle: true,
        sameAsCompanyAddress: true,
        address: true,
        state: true,
        city: true,
        zipCode: true,
      },
      false,
    );
  };

  const validateInformation = async () => {
    markInformationTouched();
    const nextErrors = await validateForm();
    if (!isEditMode) {
      delete nextErrors.sale;
    }
    const isDateValid = validateDateSection();
    return Object.keys(nextErrors).length === 0 && isDateValid;
  };

  const toApiDate = (value: string) => {
    const parsed = moment(value, 'DD/MM/YYYY', true);
    return parsed.isValid() ? parsed.format('YYYY-MM-DD') : value;
  };

  const toApiTime = (value: string) => {
    const parsed = moment(value, ['hh:mm A', 'HH:mm'], true);
    return parsed.isValid() ? parsed.format('HH:mm') : '00:00';
  };

  const getSaleTypeTimeCheck = () => {
    const map: Record<DateMode, string> = {
      'One day sale': 'single',
      'Multiple day sale': 'multiple',
      'Start date / End date': 'start_end',
      'Date to be announced': 'date_announcement',
      'One Day Online Only Sale': 'online_only',
    };

    return map[form.dateMode];
  };

  const getMultiStartDate = () => {
    if (form.dateMode === 'Multiple day sale') {
      return saleDateRows.map(row => ({
        startDate: toApiDate(row.date),
        startTime: toApiTime(row.startTime),
        endTime: toApiTime(row.endTime),
      }));
    }

    if (form.dateMode === 'Start date / End date') {
      return [
        {
          startDate: toApiDate(rangeDates.startDate),
          startTime: toApiTime(rangeDates.startTime),
          endTime: '00:00',
        },
        {
          startDate: toApiDate(rangeDates.endDate),
          startTime: toApiTime(rangeDates.endTime),
          endTime: '00:00',
        },
      ];
    }

    if (form.dateMode === 'One Day Online Only Sale') {
      return [
        {
          startDate: toApiDate(onlineDates.startDate),
          startTime: '00:00',
          endTime: '00:00',
        },
        {
          startDate: toApiDate(onlineDates.endDate),
          startTime: '00:00',
          endTime: '00:00',
        },
      ];
    }

    if (form.dateMode === 'Date to be announced') {
      return [];
    }

    return [
      {
        startDate: toApiDate(form.saleDate),
        startTime: toApiTime(form.startTime),
        endTime: toApiTime(form.endTime),
      },
    ];
  };

  const getTimeZoneValue = (option: string) =>
    timeZoneOptionToZone[option] || option;

  const appendFile = (formData: FormData, key: string, file: SelectedFile) => {
    formData.append(key, {
      uri: file.uri,
      name: file.name,
      type: file.type || 'application/octet-stream',
    } as any);
  };

  const appendJsonField = (formData: FormData, key: string, value: any) => {
    formData.append(key, JSON.stringify(value));
  };

  const logPayload = (label: string, payload: any) => {
    const parts = (payload as any)?._parts;
    const decodedPayload = Array.isArray(parts)
      ? parts.reduce((acc: Record<string, any>, [key, value]: [string, any]) => {
        acc[key] = value;
        return acc;
      }, {})
      : payload;

    console.log(label, {
      formData: payload,
      decodedPayload,
    });
  };

  const getSaleIdFromResponse = (response: any) => {
    if (typeof response?.data === 'string') return response.data;
    if (typeof response?.datas === 'string') return response.datas;

    return (
      response?.data?._id ||
      response?.data?.id ||
      response?.data?.saleId ||
      response?.data?.sale?._id ||
      response?.data?.sale?.id ||
      response?.datas?._id ||
      response?.datas?.id ||
      response?.datas?.saleId ||
      response?.datas?.sale?._id ||
      response?.datas?.sale?.id ||
      response?._id ||
      response?.id ||
      response?.saleId ||
      response?.sale?._id ||
      response?.sale?.id ||
      selectedListingSaleId ||
      ''
    );
  };

  const buildInformationPayload = () => {
    const payload = new FormData();

    payload.append('bussinessName', form.businessName);
    payload.append('state', form.state);
    payload.append('title', form.title);
    payload.append('saleType', form.saleType);
    payload.append('shortDescription', form.shortDescription);
    payload.append('fullDescription', form.fullDescription);
    appendJsonField(payload, 'multiStartDate', getMultiStartDate());
    payload.append('slaeTypeTimeCheck', getSaleTypeTimeCheck());
    appendJsonField(payload, 'categoryIds', form.categories);
    payload.append('fileTitle', form.uploadTitle);
    payload.append('city', form.city);
    payload.append('address', form.address);
    payload.append('zipCode', form.zipCode);
    payload.append('isSameAddress', String(form.sameAsCompanyAddress));

    const userTZValue = getTimeZoneValue(form.userTimeZone);
    const saleTZValue = getTimeZoneValue(form.saleTimeZone);

    appendJsonField(payload, 'currentTimeZone', {
      value: userTZValue,
    });
    appendJsonField(payload, 'saleTimeZone', {
      value: saleTZValue,
    });

    if (isEditMode && selectedListingSaleId) {
      payload.append('id', selectedListingSaleId);
    }

    uploadFiles.forEach(file => appendFile(payload, 'filesUploads', file));

    return payload;
  };

  const submitInformation = async () => {
    const payload = buildInformationPayload();

    console.log('Add sale information FormData', payload);

    try {
      const response = await addSaleInformationMutation.mutateAsync({
        payload,
      });
      const nextSaleId = getSaleIdFromResponse(response);

      if (!nextSaleId) {
        AppToast.error('Sale information saved, but sale id was not returned');
        return false;
      }

      setCreatedSaleId(nextSaleId);
      AppToast.success('Sale information saved successfully');
      return true;
    } catch (error) {
      console.log('Add sale information failed', error);
      return false;
    }
  };

  const submitImages = async () => {
    if (!images.length && !removedImages.length) {
      console.log('Add sale images payload', {
        id: createdSaleId || selectedListingSaleId,
        images: [],
      });
      AppToast.success('Sale images step completed');
      return true;
    }

    const saleId = createdSaleId || selectedListingSaleId;
    if (!saleId) {
      AppToast.error('Please save sale information before uploading images');
      return false;
    }

    const payload = new FormData();
    payload.append('id', saleId);

    // Only upload new images (not existing remote ones)
    const newImages = images.filter(image => !image.isExisting);
    newImages.forEach(image => appendFile(payload, 'images', image));

    // Send deleted image paths
    if (isEditMode && removedImages.length > 0) {
      payload.append('removedImages', JSON.stringify(removedImages));
      payload.append('removedPhotos', JSON.stringify(removedImages));
      payload.append('deletedImages', JSON.stringify(removedImages));
    }

    logPayload('Add sale images payload', payload);

    try {
      await addSaleImagesMutation.mutateAsync({ payload });
      AppToast.success('Sale images updated successfully');
      return true;
    } catch (error) {
      console.log('Add sale images failed', error);
      return false;
    }
  };

  const submitFinalize = async () => {
    console.log('Add sale finalize payload', {
      id: createdSaleId || selectedListingSaleId,
      mode: isEditMode ? 'edit' : 'add',
      title: form.title,
    });
    AppToast.success('Sale finalized successfully');
    return true;
  };

  const resetAddSaleState = useCallback(() => {
    resetForm({
      values: {
        ...initialForm,
        businessName: companySlug,
      },
    });
    setStep(1);
    setSelectConfig(null);
    setPickerConfig(null);
    setPickerValue(new Date());
    setImages([]);
    setRemovedImages([]);
    setUploadFiles([]);
    setCreatedSaleId('');
    setDateSectionError('');
    setSaleDateRows([
      { id: '1', date: '', startTime: '12:00 AM', endTime: '12:00 AM' },
    ]);
    setRangeDates({
      startDate: '',
      endDate: '',
      startTime: '12:00 AM',
      endTime: '12:00 AM',
    });
    setOnlineDates({
      startDate: '',
      endDate: '',
    });
  }, [companySlug, resetForm]);

  useEffect(() => {
    if (isEditMode) return;

    resetAddSaleState();
  }, [isEditMode, resetAddSaleState, route.params]);

  const handleFinalize = async () => {
    if (!(await submitFinalize())) return;

    resetAddSaleState();

    navigation.navigate('DashboardTabs', {
      screen: routes.salesTab,
      params: { refreshAt: Date.now() },
    });
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!(await validateInformation())) return;
      if (!(await submitInformation())) return;
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!(await submitImages())) return;
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigation.goBack();
      return;
    }
    setStep(prev => (prev - 1) as Step);
  };

  const handleStepPress = async (nextStep: Step) => {
    if (step === 3 && nextStep < step) return;

    if (nextStep <= step) {
      setStep(nextStep);
      return;
    }

    if (nextStep === step + 1) {
      await handleNext();
      return;
    }

    await handleNext();
  };

  const handleDateModeChange = (dateMode: DateMode) => {
    updateField('dateMode', dateMode);
    setDateSectionError('');
  };

  const formatDate = (date: Date) =>
    moment(date).format('DD/MM/YYYY');

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

  const getPickerStoredValue = (config: PickerConfig) => {
    if (config.target === 'form') {
      return form[config.key];
    }
    if (config.target === 'multi') {
      return saleDateRows.find(row => row.id === config.id)?.[config.key] || '';
    }
    if (config.target === 'range') {
      return rangeDates[config.key];
    }
    return onlineDates[config.key];
  };

  const getDateFromPickerConfig = (config: PickerConfig) => {
    const storedValue = String(getPickerStoredValue(config) || '');
    const parsed =
      config.mode === 'date'
        ? moment(storedValue, 'DD/MM/YYYY', true)
        : moment(storedValue, 'hh:mm A', true);

    return parsed.isValid() ? parsed.toDate() : new Date();
  };

  const openPicker = (config: PickerConfig) => {
    setPickerValue(getDateFromPickerConfig(config));
    setPickerConfig(config);
  };

  const handlePickerDismiss = () => {
    setPickerConfig(null);
  };

  const handleDateTimeChange = (
    event: DateTimePickerChangeEvent,
    selectedDate: Date,
  ) => {
    if (Platform.OS === 'android') {
      setPickerConfig(null);
    }

    if (!selectedDate || !pickerConfig) return;

    setPickerValue(selectedDate);

    const value =
      pickerConfig.mode === 'date'
        ? formatDate(selectedDate)
        : formatTime(selectedDate);

    if (pickerConfig.target === 'form') {
      updateField(pickerConfig.key, value);
      return;
    }

    if (pickerConfig.target === 'multi') {
      setSaleDateRows(prev =>
        prev.map(row =>
          row.id === pickerConfig.id
            ? { ...row, [pickerConfig.key]: value }
            : row,
        ),
      );
      setDateSectionError('');
      return;
    }

    if (pickerConfig.target === 'range') {
      setRangeDates(prev => ({ ...prev, [pickerConfig.key]: value }));
      setDateSectionError('');
      return;
    }

    setOnlineDates(prev => ({ ...prev, [pickerConfig.key]: value }));
    setDateSectionError('');
  };
  const addSaleDateRow = () => {
    setSaleDateRows(prev => [
      ...prev,
      {
        id: `${Date.now()}`,
        date: '',
        startTime: '12:00 AM',
        endTime: '12:00 AM',
      },
    ]);
  };

  const removeSaleDateRow = (id: string) => {
    setSaleDateRows(prev =>
      prev.length === 1 ? prev : prev.filter(row => row.id !== id),
    );
  };

  const handleSelectPlace = (place: GooglePlaceResult) => {
    updateField('address', place.address);
    if (place.state) updateField('state', place.state);
    if (place.city) updateField('city', place.city);
    if (place.zipCode) updateField('zipCode', place.zipCode);
  };

  const handleSameAsCompanyAddress = () => {
    const shouldUseCompanyAddress = !form.sameAsCompanyAddress;

    updateField('sameAsCompanyAddress', shouldUseCompanyAddress);

    if (!shouldUseCompanyAddress) {
      updateField('address', '');
      updateField('state', '');
      updateField('city', '');
      updateField('zipCode', '');
      return;
    }

    updateField('address', profile?.address || '');
    updateField('state', profile?.state || '');
    updateField('city', profile?.city || '');
    updateField('zipCode', profile?.zipCode || '');
  };

  const handlePickUploadFile = async () => {
    try {
      const result = await pick({
        type: [types.allFiles],
        allowMultiSelection: true,
      });

      setUploadFiles(
        result.map(file => ({
          uri: file.uri,
          name: file.name || 'Selected file',
          type: file.type || undefined,
          size: file.size || undefined,
        })),
      );
    } catch (error: any) {
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') {
        console.log('File picker error', error);
      }
    }
  };

  const handlePickImage = async () => {
    const remainingLimit = 15 - images.length;
    if (remainingLimit <= 0) {
      AppToast.error('Maximum 15 photos reached');
      return;
    }

    Alert.alert(
      'Select Photos',
      `You can add up to ${remainingLimit} more photos. Choose gallery to select multiple at once.`,
      [
        {
          text: 'Camera',
          onPress: async () => {
            const result = await takePhotoWithCamera({ mediaType: 'photo' });
            const validation = validateImage(result);
            if (!validation.isValid || !result.uri) {
              if (result.error) AppToast.error(result.error);
              return;
            }
            setImages(prev => [
              ...prev,
              {
                uri: result.uri!,
                name: result.fileName || `Listing image ${prev.length + 1}`,
                type: result.type,
                size: result.fileSize,
              },
            ]);
            AppToast.success('Photo added');
          },
        },
        {
          text: 'Gallery',
          onPress: () => {
            launchImageLibrary(
              {
                mediaType: 'photo',
                selectionLimit: remainingLimit,
                quality: 0.8,
              },
              response => {
                if (response.didCancel) return;
                if (response.errorCode) {
                  AppToast.error(response.errorMessage || 'Failed to open gallery');
                  return;
                }
                if (response.assets && response.assets.length > 0) {
                  const newPicked: SelectedFile[] = [];
                  response.assets.forEach((asset, idx) => {
                    if (asset.uri) {
                      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
                        AppToast.error(`${asset.fileName || 'Image'} is larger than 5MB limit`);
                        return;
                      }
                      newPicked.push({
                        uri: asset.uri,
                        name: asset.fileName || `Listing image ${images.length + idx + 1}`,
                        type: asset.type,
                        size: asset.fileSize,
                      });
                    }
                  });
                  if (newPicked.length > 0) {
                    setImages(prev => [...prev, ...newPicked]);
                    AppToast.success(`Added ${newPicked.length} photos`);
                  }
                }
              }
            );
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleRemoveImage = (index: number) => {
    const removedItem = images[index];
    if (removedItem.isExisting && removedItem.originalPath) {
      setRemovedImages(prev => [...prev, removedItem.originalPath!]);
    }
    setImages(prev => prev.filter((_, idx) => idx !== index));
    AppToast.success('Image removed');
  };

  const renderSelect = (
    key: keyof FormState,
    label: string,
    options: string[],
    placeholder: string,
    required = false,
  ) => (
    <SelectField
      label={label}
      value={form[key] as string}
      placeholder={placeholder}
      required={required}
      error={getFieldError(key)}
      onPress={() => setSelectConfig({ key, title: label, options })}
    />
  );

  const renderInput = (
    key: keyof FormState,
    label: string,
    placeholder: string,
    required = false,
    multiline = false,
    maxLength?: number,
  ) => (
    <TextInputField
      label={label}
      value={form[key] as string}
      placeholder={placeholder}
      required={required}
      multiline={multiline}
      maxLength={maxLength}
      error={getFieldError(key)}
      onChangeText={text => updateField(key, text)}
    />
  );

  const renderPickerField = (
    label: string,
    value: string,
    placeholder: string,
    mode: PickerMode,
    onPress: () => void,
    required = false,
    error?: string,
  ) => (
    <DateTimeField
      label={label}
      value={value}
      placeholder={placeholder}
      mode={mode}
      required={required}
      error={error}
      onPress={onPress}
    />
  );

  const renderTimeZones = () => (
    <View>
      {renderSelect(
        'userTimeZone',
        'Your time zone',
        timeZoneOptions,
        'Select time zone',
      )}
      {renderSelect(
        'saleTimeZone',
        'Sale time zone',
        timeZoneOptions,
        'Select time zone',
      )}
    </View>
  );

  const renderDateFields = () => {
    if (form.dateMode === 'Date to be announced') {
      return renderTimeZones();
    }

    if (form.dateMode === 'Multiple day sale') {
      return (
        <View>
          {saleDateRows.map((row, index) => (
            <View key={row.id} style={styles.dateRow}>
              <View style={styles.dateRowFields}>
                {renderPickerField(
                  index === 0 ? 'Sale dates' : 'Date',
                  row.date,
                  'dd/mm/yyyy',
                  'date',
                  () =>
                    openPicker({
                      target: 'multi',
                      id: row.id,
                      key: 'date',
                      mode: 'date',
                    }),
                  true,
                )}
                <View style={styles.twoColumn}>
                  {renderPickerField(
                    'Start Time',
                    row.startTime,
                    '12:00 AM',
                    'time',
                    () =>
                      openPicker({
                        target: 'multi',
                        id: row.id,
                        key: 'startTime',
                        mode: 'time',
                      }),
                  )}
                  {renderPickerField(
                    'End time',
                    row.endTime,
                    '12:00 AM',
                    'time',
                    () =>
                      openPicker({
                        target: 'multi',
                        id: row.id,
                        key: 'endTime',
                        mode: 'time',
                      }),
                  )}
                </View>
              </View>
              {saleDateRows.length > 1 ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.removeDateButton}
                  onPress={() => removeSaleDateRow(row.id)}>
                  <Icon name="close" size={ms(15)} color={colors.white} />
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.addDateButton}
            onPress={addSaleDateRow}>
            <AppText
              title="Add"
              fontySize="px14"
              fontFamily="bold"
              color="textLight"
            />
          </TouchableOpacity>
          <ErrorText error={dateSectionError} />
          {renderTimeZones()}
        </View>
      );
    }

    if (form.dateMode === 'Start date / End date') {
      return (
        <View>
          <View style={styles.twoColumn}>
            {renderPickerField(
              'Start Date',
              rangeDates.startDate,
              'dd/mm/yyyy',
              'date',
              () =>
                openPicker({
                  target: 'range',
                  key: 'startDate',
                  mode: 'date',
                }),
            )}
            {renderPickerField(
              'Start Time',
              rangeDates.startTime,
              '12:00 AM',
              'time',
              () =>
                openPicker({
                  target: 'range',
                  key: 'startTime',
                  mode: 'time',
                }),
            )}
          </View>
          <View style={styles.twoColumn}>
            {renderPickerField(
              'End Date',
              rangeDates.endDate,
              'dd/mm/yyyy',
              'date',
              () =>
                openPicker({
                  target: 'range',
                  key: 'endDate',
                  mode: 'date',
                }),
            )}
            {renderPickerField(
              'End Time',
              rangeDates.endTime,
              '12:00 AM',
              'time',
              () =>
                openPicker({
                  target: 'range',
                  key: 'endTime',
                  mode: 'time',
                }),
            )}
          </View>
          <ErrorText error={dateSectionError} />
          {renderTimeZones()}
        </View>
      );
    }

    if (form.dateMode === 'One Day Online Only Sale') {
      return (
        <View>
          <View style={styles.twoColumn}>
            {renderPickerField(
              'Start Date',
              onlineDates.startDate,
              'dd/mm/yyyy',
              'date',
              () =>
                openPicker({
                  target: 'online',
                  key: 'startDate',
                  mode: 'date',
                }),
            )}
            {renderPickerField(
              'End Date',
              onlineDates.endDate,
              'dd/mm/yyyy',
              'date',
              () =>
                openPicker({
                  target: 'online',
                  key: 'endDate',
                  mode: 'date',
                }),
            )}
          </View>
          <ErrorText error={dateSectionError} />
          {renderTimeZones()}
        </View>
      );
    }

    return (
      <View>
        {renderPickerField(
          'Sale dates',
          form.saleDate,
          'dd/mm/yyyy',
          'date',
          () => openPicker({ target: 'form', key: 'saleDate', mode: 'date' }),
          true,
          getFieldError('saleDate'),
        )}
        <View style={styles.twoColumn}>
          {renderPickerField(
            'Start Time',
            form.startTime,
            '12:00 AM',
            'time',
            () => openPicker({ target: 'form', key: 'startTime', mode: 'time' }),
          )}
          {renderPickerField('End time', form.endTime, '12:00 AM', 'time', () =>
            openPicker({ target: 'form', key: 'endTime', mode: 'time' }),
          )}
        </View>
        {renderTimeZones()}
      </View>
    );
  };

  const renderInformationStep = () => (
    <View>
      <AppText
        title="Listing Information"
        fontySize="px20"
        fontFamily="bold"
        marginBottom={vs(14)}
      />
      <SelectField
        label="Business Name"
        value={form.businessName}
        placeholder={
          isProfileLoading ? 'Loading business name...' : 'Business Name'
        }
        required
        error={getFieldError('businessName')}
        disabled
        showIcon={false}
      />
      {renderInput('title', 'Title', 'Enter title', true)}
      {renderSelect(
        'saleType',
        'Sale Type',
        saleTypeOptions,
        isSaleTypesLoading
          ? 'Loading sale types...'
          : isSaleTypesError
            ? 'Unable to load sale types'
            : '-- Select Sale Type --',
        true,
      )}

      <View style={styles.field}>
        <FieldLabel
          label="Category (Please select one or more option)"
          required
        />
        <View style={styles.categoryGrid}>
          {categoryOptions.map((category: CategoryItem) => {
            const selected = form.categories.includes(category._id);
            return (
              <CheckboxRow
                key={category._id}
                label={category.name}
                selected={selected}
                error={!!getCategoryError()}
                onPress={() => toggleCategory(category._id)}
              />
            );
          })}
        </View>
        {isCategoriesError ? (
          <AppText
            title="Unable to load categories"
            color="error"
            fontySize="px12"
          />
        ) : null}
        <ErrorText error={getCategoryError()} />
      </View>

      {renderInput(
        'shortDescription',
        'Short Description',
        'Enter short description',
        true,
        true,
        350,
      )}
      {renderInput(
        'fullDescription',
        'Full Description',
        'Enter full description',
        true,
        true,
        4500,
      )}

      <AppText
        title="Dates and Times"
        fontySize="px20"
        fontFamily="bold"
        marginTop={vs(8)}
        marginBottom={vs(10)}
      />
      <FieldLabel label="Sale Type" required />
      <View style={styles.radioGroup}>
        {dateModeOptions.map(option => {
          const selected = form.dateMode === option;
          return (
            <RadioRow
              key={option}
              label={option}
              selected={selected}
              onPress={() => handleDateModeChange(option)}
            />
          );
        })}
      </View>

      {renderDateFields()}

      <AppText
        title="Uploads (Optional)"
        fontySize="px20"
        fontFamily="bold"
        marginTop={vs(8)}
        marginBottom={vs(10)}
      />
      {renderInput('uploadTitle', 'Upload multi file', 'Enter title')}
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.fileButton}
        onPress={handlePickUploadFile}>
        <AppText
          title={
            uploadFiles.length
              ? `${uploadFiles.length} file selected`
              : 'Choose file'
          }
          fontySize="px14"
          color="textSecondary"
        />
        <Icon
          name="cloud-upload-outline"
          size={ms(20)}
          color={colors.primary}
        />
      </TouchableOpacity>

      <AppText
        title="Location"
        fontySize="px20"
        fontFamily="bold"
        marginTop={vs(20)}
        marginBottom={vs(12)}
      />
      <CheckboxRow
        label="Same as Company Address"
        selected={form.sameAsCompanyAddress}
        width="100%"
        onPress={handleSameAsCompanyAddress}
      />
      <View style={styles.field}>
        <FieldLabel label="Address" required />
        <GooglePlaceAutoComplete
          value={form.address}
          error={getFieldError('address')}
          onChangeText={text => updateField('address', text)}
          onSelectPlace={handleSelectPlace}
        />
      </View>
      {renderSelect('state', 'State', stateSelectOptions, 'Select State', true)}
      {renderSelect('city', 'City', citySelectOptions, 'Select city', true)}
      {renderInput('zipCode', 'Zip code', 'Zip code', true)}
    </View>
  );

  const renderImageStep = () => (
    <View>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.dropZone}
        onPress={handlePickImage}>
        <Icon name="cloud-upload-outline" size={ms(28)} color={colors.dark} />
        <AppText
          title="Drop files here to upload"
          fontySize="px14"
          color="textSecondary"
          marginTop={vs(8)}
        />
      </TouchableOpacity>
      {images.length ? (
        <View style={styles.imageCardGrid}>
          {images.map((image, index) => (
            <View key={`${image.uri}-${index}`} style={styles.imageCard}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.deleteImageButton}
                onPress={() => handleRemoveImage(index)}>
                <Icon name="close" size={ms(12)} color={colors.white} />
              </TouchableOpacity>
              <Image
                source={{ uri: image.uri }}
                style={styles.imageCardPreview}
                resizeMode="cover"
              />
            </View>
          ))}
        </View>
      ) : null}
      <AppText
        title="You may upload up to 15 images for your listing."
        fontySize="px16"
        fontFamily="bold"
        color="textPrimary"
        marginTop={vs(18)}
      />
    </View>
  );

  const formatPreviewDate = (date: string) => {
    const parsed = moment(date, 'DD/MM/YYYY', true);
    return parsed.isValid() ? parsed.format('MMM DD, YYYY') : date;
  };

  const getFinalizePreviewDates = () => {
    if (form.dateMode === 'Multiple day sale') {
      const firstDate = saleDateRows[0]?.date || '';
      const lastDate = saleDateRows[saleDateRows.length - 1]?.date || firstDate;
      return {
        start: firstDate ? formatPreviewDate(firstDate) : 'To be announced',
        end: lastDate ? formatPreviewDate(lastDate) : 'To be announced',
      };
    }

    if (form.dateMode === 'Start date / End date') {
      return {
        start: rangeDates.startDate
          ? formatPreviewDate(rangeDates.startDate)
          : 'To be announced',
        end: rangeDates.endDate
          ? formatPreviewDate(rangeDates.endDate)
          : 'To be announced',
      };
    }

    if (form.dateMode === 'One Day Online Only Sale') {
      return {
        start: onlineDates.startDate
          ? formatPreviewDate(onlineDates.startDate)
          : 'To be announced',
        end: onlineDates.endDate
          ? formatPreviewDate(onlineDates.endDate)
          : 'To be announced',
      };
    }

    if (form.dateMode === 'Date to be announced') {
      return {
        start: 'To be announced',
        end: 'To be announced',
      };
    }

    const saleDate = form.saleDate ? formatPreviewDate(form.saleDate) : '';
    return {
      start: saleDate || 'To be announced',
      end: saleDate || 'To be announced',
    };
  };

  const renderFinalizeStep = () => {
    const previewDates = getFinalizePreviewDates();

    if (images.length > 0) {
      console.log('Image path:', images[0].uri);
    }

    return (
      <View>
        <View style={styles.previewTop}>
          {images.length === 0 ? (
            <View style={styles.previewImage}>
              <Icon
                name="image-outline"
                size={ms(34)}
                color={colors.textSecondary}
              />
              <View style={styles.imageCountBadge}>
                <Icon name="images-outline" size={ms(12)} color={colors.white} />
                <AppText
                  title="0 images"
                  fontySize="px10"
                  color="textLight"
                  marginLeft={scale(4)}
                />
              </View>
            </View>
          ) : images.length === 1 ? (
            <View style={styles.previewImage}>
              <Image
                source={{ uri: images[0].uri }}
                style={{ width: '100%', height: '100%', borderRadius: ms(8) }}
                resizeMode="cover"
              />
              <View style={styles.imageCountBadge}>
                <Icon name="images-outline" size={ms(12)} color={colors.white} />
                <AppText
                  title="1 images"
                  fontySize="px10"
                  color="textLight"
                  marginLeft={scale(4)}
                />
              </View>
            </View>
          ) : (
            <View style={[styles.previewImage, { alignItems: 'stretch', justifyContent: 'flex-start', backgroundColor: 'transparent' }]}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: scale(10) }}>
                {images.map((image, index) => (
                  <Image
                    key={`${image.uri}-${index}`}
                    source={{ uri: image.uri }}
                    style={{
                      width: scale(270),
                      height: '100%',
                      borderRadius: ms(8),
                    }}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              <View style={styles.imageCountBadge}>
                <Icon name="images-outline" size={ms(12)} color={colors.white} />
                <AppText
                  title={`${images.length} images`}
                  fontySize="px10"
                  color="textLight"
                  marginLeft={scale(4)}
                />
              </View>
            </View>
          )}
          <View style={styles.previewInfo}>
            <AppText
              title={form.title || form.sale}
              fontySize="px22"
              fontFamily="bold"
              color="dark"
            />
            <AppText
              title={`By: ${form.businessName}`}
              fontySize="px14"
              fontFamily="bold"
              color="primary"
              marginTop={vs(6)}
            />
            <PreviewLine icon="pricetag-outline" text={form.saleType} />
            <PreviewLine icon="albums-outline" text={selectedCategoriesText} />
            <PreviewLine
              icon="location-outline"
              text={`${form.address}, ${form.state}, ${form.city}`}
              boldLabel="Location"
            />
            <PreviewLine
              icon="document-text-outline"
              text={form.fullDescription || form.shortDescription}
              boldLabel="Description:"
            />
            <PreviewLine
              icon="calendar-outline"
              text={previewDates.start}
              boldLabel="Start:"
            />
            <PreviewLine
              icon="calendar-outline"
              text={previewDates.end}
              boldLabel="Begins Ending:"
            />
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusTitle}>
            <Icon name="time-outline" size={ms(14)} color={colors.dark} />
            <AppText
              title="In Process"
              fontySize="px12"
              fontFamily="bold"
              marginLeft={scale(4)}
            />
          </View>
          <View style={styles.dateCard}>
            <Icon name="calendar-outline" size={ms(20)} color={colors.dark} />
            <View style={styles.dateText}>
              <AppText
                title={form.saleDate || 'May 07, 2026'}
                fontySize="px14"
                fontFamily="bold"
              />
              <AppText
                title={`at ${form.startTime}`}
                fontySize="px12"
                color="textPrimary"
              />
            </View>
            <Icon
              name="information-circle-outline"
              size={ms(20)}
              color={colors.dark}
            />
          </View>
          <PreviewLine
            icon="location-outline"
            text={`${form.address}, ${form.state}, ${form.city}`}
            boldLabel="Location"
          />
          {/* <TouchableOpacity activeOpacity={0.8} style={styles.detailsButton}>
          <AppText
            title="View Details"
            fontySize="px14"
            fontFamily="bold"
            color="textLight"
          />
        </TouchableOpacity> */}
        </View>

        <View style={styles.completeBox}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.completeButton, styles.settingsButton]}
            onPress={() =>
              navigation.navigate(routes.addSaleSettingsScreen, {
                saleId: createdSaleId || selectedListingSaleId,
                selectedSale:
                  selectedListingSale ||
                  ({
                    _id: createdSaleId || selectedListingSaleId,
                    title: form.title,
                    saleType: form.saleType,
                    startDate: form.saleDate,
                    //@ts-ignore
                    endDate: form.endDate,
                  } as SalesListingItem),
              })
            }>
            <AppText
              title="Settings"
              fontySize="px14"
              fontFamily="bold"
              color="textLight"
            />
          </TouchableOpacity>
          {/* <View style={styles.completeButton}>
            <AppText
              title="Details Complete"
              fontySize="px14"
              fontFamily="bold"
              color="textLight"
            />
          </View> */}
        </View>
      </View>
    );
  };

  const isSubmitting =
    addSaleInformationMutation.isPending || addSaleImagesMutation.isPending;
  const isInitialLoading =
    isProfileLoading ||
    (isEditMode && isSalesListingLoading) ||
    isSaleTypesLoading ||
    isCategoriesLoading;

  return (
    <View style={styles.container}>
      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
        title="Add New Sale"
        showBorder={false}
      />
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={80}
        extraHeight={120}>
        {step === 1 &&
          isEditMode &&
          renderSelect(
            'sale',
            'Sales',
            saleOptions,
            isSalesListingLoading
              ? 'Loading sales...'
              : isSalesListingError
                ? 'Unable to load sales'
                : 'Select Sale',
          )}
        <StepTabs currentStep={step} onPress={handleStepPress} />
        {step === 1 && renderInformationStep()}
        {step === 2 && renderImageStep()}
        {step === 3 && renderFinalizeStep()}
      </KeyboardAwareScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.footerButton, styles.backButton]}
          onPress={handleBack}>
          <AppText
            title="Back"
            fontySize="px14"
            fontFamily="bold"
            color="textLight"
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.footerButton,
            step === 3 ? styles.settingsButton : styles.nextButton,
          ]}
          disabled={isSubmitting}
          onPress={step === 3 ? handleFinalize : handleNext}>
          <AppText
            title={
              isSubmitting ? 'Please wait...' : step === 3 ? 'Finalize' : 'Next'
            }
            fontySize="px14"
            fontFamily="bold"
            color="textLight"
          />
        </TouchableOpacity>
      </View>

      {pickerConfig ? (
        <View style={styles.pickerContainer}>
          {Platform.OS === 'ios' ? (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.pickerDone}
              onPress={() => setPickerConfig(null)}>
              <AppText
                title="Done"
                fontySize="px14"
                fontFamily="bold"
                color="primary"
              />
            </TouchableOpacity>
          ) : null}
          <DateTimePicker
            value={pickerValue}
            mode={pickerConfig.mode}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant="light"
            textColor={colors.textPrimary}
            accentColor={colors.primary}
            style={styles.dateTimePicker}
            onValueChange={handleDateTimeChange}
            onDismiss={handlePickerDismiss}
            onNeutralButtonPress={handlePickerDismiss}
          />
        </View>
      ) : null}

      <Modal
        visible={!!selectConfig}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectConfig(null)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectConfig(null)}>
          <Pressable style={styles.optionSheet}>
            <AppText
              title={selectConfig?.title}
              fontySize="px18"
              fontFamily="bold"
              marginBottom={vs(12)}
            />
            <ScrollView keyboardShouldPersistTaps="handled">
              {selectConfig?.options.map((option, index) => (
                <TouchableOpacity
                  key={`${selectConfig.key}-${option}-${index}`}
                  activeOpacity={0.8}
                  style={styles.optionRow}
                  onPress={() => {
                    updateField(selectConfig.key, option);
                    if (selectConfig.key === 'state') {
                      updateField('city', '');
                    }
                    setSelectConfig(null);
                  }}>
                  <AppText title={option} fontySize="px14" />
                  {form[selectConfig.key] === option && (
                    <Icon
                      name="checkmark"
                      size={ms(20)}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
      <Loader
        isLoading={isInitialLoading || isSubmitting}
        transparent={!isInitialLoading}
      />
    </View>
  );
};

const StepTabs = ({
  currentStep,
  onPress,
}: {
  currentStep: Step;
  onPress: (step: Step) => void;
}) => {
  const steps: { id: Step; title: string }[] = [
    { id: 1, title: 'Information' },
    { id: 2, title: 'Add image' },
    { id: 3, title: 'Finalize' },
  ];

  return (
    <View style={styles.stepsRow}>
      {steps.map(item => {
        const active = item.id === currentStep;
        const disabled = currentStep === 3 && item.id < currentStep;
        return (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.8}
            style={[styles.stepPill, active && styles.stepPillActive]}
            disabled={disabled}
            onPress={() => onPress(item.id)}>
            <View
              style={[styles.stepNumber, active && styles.stepNumberActive]}>
              <AppText
                title={String(item.id)}
                fontySize="px12"
                fontFamily="bold"
                color="textLight"
              />
            </View>
            <AppText
              title={item.title}
              fontySize="px12"
              fontFamily={active ? 'bold' : 'regular'}
              color={active ? 'textLight' : 'textPrimary'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const PreviewLine = ({
  icon,
  text,
  boldLabel,
}: {
  icon: string;
  text: string;
  boldLabel?: string;
}) => (
  <View style={styles.previewLine}>
    <Icon name={icon} size={ms(14)} color={colors.textPrimary} />
    <View style={styles.previewLineText}>
      {boldLabel ? (
        <AppText title={boldLabel} fontySize="px12" fontFamily="bold" />
      ) : null}
      <AppText title={text} fontySize="px12" color="textPrimary" />
    </View>
  </View>
);

export default AddNewSaleScreen;
