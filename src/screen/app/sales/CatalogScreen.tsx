import React, {useState, useCallback} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Image,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {AppText} from '../../../components/AppText';
import {colors} from '../../../constants';
import {ms, vs} from '../../../utils/responsive';
import {routes} from '../../../navigation/route';
import AppHeader from '../../../components/appHeader';
import {useGetCatalogDetails} from '../../../services/queries/app/catlog';
import {useDebounce} from '../../../utils/debounce';
import {ImageComponent} from '../../../components/AppImage';
import Loader from '../../../components/loader';
import AppModal from '../../../components/AppModal';
import AppButton from '../../../components/appButton';
import {
  FilePickerResult,
  ImagePickerResult,
  pickCSVFile,
  showImagePickerAlert,
  validateCSV,
  validateImage,
} from '../../../utils/imagePicker';
import AppToast from '../../../components/toaster';
import {useUploadLotCSV} from '../../../services/queries/app/catlog/ImportCSVFile';
import {useImportImages} from '../../../services/queries/app/catlog/ImportImages';

const CatalogScreen = () => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const {sale} = route.params || {};

  // State for API parameters
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 500);
  const [selectedTemplate, setSelectedTemplate] = useState<string | undefined>(
    undefined,
  ); // empty for now

  // Use the real hook
  const {data, isLoading, isFetching, error, refetch} = useGetCatalogDetails({
    saleId: sale?.saleId,
    templateId: selectedTemplate,
    page,
    perPage,
    search: debouncedSearch,
  });
  const [showImportModal, setShowImportModal] = useState(false);
  const [file, setFile] = useState<FilePickerResult | null>(null);
  const [image, setImage] = useState<ImagePickerResult | null>(null);
  const {mutate: uploadCSV, isPending} = useUploadLotCSV();
  const {mutate: mobileBulkUpload, isPending: isUploadingImages} =
    useImportImages();

  const lots = data?.data || [];
  const pagination = data?.pagination;
  const totalItems = pagination?.totalItems || 0;
  const totalPages = pagination?.totalPages || 1;
  const hasNextPage = pagination?.hasNextPage || false;
  const hasPrevPage = pagination?.hasPrevPage || false;

  // Reset page when search changes
  const handleSearchChange = (text: string) => {
    setSearchText(text);
    setPage(1);
  };

  // Pagination handlers
  const goToNextPage = () => {
    if (hasNextPage) setPage(prev => prev + 1);
  };

  const goToPrevPage = () => {
    if (hasPrevPage) setPage(prev => prev - 1);
  };

  // Per page change (simple cycle for demo, you can replace with modal)
  const changePerPage = () => {
    const options = [10, 20, 50, 100];
    const currentIndex = options.indexOf(perPage);
    const nextIndex = (currentIndex + 1) % options.length;
    setPerPage(options[nextIndex]);
    setPage(1);
  };

  const handleAddLot = () => {
    navigation.navigate(routes.addNewLotScreen, {sale: sale});
  };

  const handleLotPress = (lot: any) => {
    // navigation.navigate(routes.lotDetailsScreen, {lot});
    console.log(lot,'lot')
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Render each lot item
  const renderLotItem = ({item}: any) => (
    <TouchableOpacity
      style={styles.lotItem}
      onPress={() => handleLotPress(item)}>
      <View style={styles.lotImagePlaceholder}>
        {item?.firstPhoto ? (
          <ImageComponent uri={item.firstPhoto} style={styles.lotImage} />
        ) : (
          // <Image source={{uri: item.firstPhoto}} style={styles.lotImage} />
          <Icon name="camera-outline" size={ms(20)} color="#9CA3AF" />
        )}
      </View>
      <View style={styles.lotContent}>
        <AppText
          title={`Lot ${item.lotNumber} | ${item.title}`}
          fontySize="px12"
          fontFamily="bold"
          color="textPrimary"
        />
        <AppText
          title={item.description}
          fontySize="px12"
          color="textPrimary"
          marginTop={vs(2)}
          numberOfLines={1}
        />
        <View style={styles.lotMeta}>
          <View style={styles.categoryTag}>
            <AppText
              title={item.category || 'Uncategorized'}
              fontySize="px10"
              color="primary"
            />
          </View>
          <View style={styles.statusContainer}>
            <AppText
              title={item.isComplete ? 'Complete' : 'Draft'}
              fontySize="px10"
              color={item.isComplete ? 'success' : 'warning'}
              fontFamily="bold"
            />
            {item.isComplete && (
              <Icon name="checkmark" size={ms(10)} color={colors.success} />
            )}
          </View>
        </View>
      </View>
      <Icon name="chevron-forward-outline" size={ms(16)} color="#9CA3AF" />
    </TouchableOpacity>
  );

  // List empty component
  const ListEmptyComponent = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name="folder-open-outline" size={ms(48)} color="#9CA3AF" />
        <AppText
          title="No lots found"
          fontySize="px14"
          color="textSecondary"
          marginTop={vs(8)}
        />
        <AppText
          title="Try adjusting your search"
          fontySize="px12"
          color="textSecondary"
        />
      </View>
    );
  };

  // List footer loader (for pagination)
  const ListFooterComponent = () => {
    if (!isFetching || isLoading) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const handleDownlaod = () => {
    setShowImportModal(true);
  };

  const handlePickCSV = async () => {
    const res = await pickCSVFile();

    const validation = validateCSV(res);

    if (!validation.isValid) {
      AppToast.error(validation.error as string);
      return;
    }

    setFile(res);
  };

  const handleUploadCSV = () => {
    if (!file) {
      AppToast.error('Please select a CSV file');
      return;
    }

    const formData = new FormData();

    formData.append('lotFile', {
      uri:
        Platform.OS === 'android' ? file.uri : file.uri?.replace('file://', ''),
      name: file.name || 'file.csv',
      type: file.type || 'text/csv',
    } as any);

    formData.append('saleId', sale?.saleId);
    formData.append('templateId', selectedTemplate || '');
    formData.append('lotValue', '0');
    uploadCSV(
      {payload: formData},
      {
        onSuccess: () => {
          setFile(null);
          setShowImportModal(false);
          refetch();
        },
      },
    );
  };

  const handlePickImage = async () => {
    const res = await showImagePickerAlert();

    const validation = validateImage(res);

    if (!validation.isValid) {
      AppToast.error(validation.error as string);
      return;
    }

    uploadSingleImage(res);
  };

  const uploadSingleImage = (img: ImagePickerResult) => {
    const formData = new FormData();

    formData.append('saleId', sale?.saleId);

    formData.append('images', {
      uri:
        Platform.OS === 'android' ? img.uri : img.uri?.replace('file://', ''),
      name: img.fileName || 'image.jpg',
      type: img.type || 'image/jpeg',
    } as any);
    setShowImportModal(false);

    mobileBulkUpload(
      {payload: formData},
      {
        onSuccess: res => {
          const unmatched = res?.data?.unmatchedImages || [];

          if (unmatched.length > 0) {
            AppToast.error(
              `Discarded Images (Not in Catalog) : ${unmatched.join(', ')}`,
            );
            // setTimeout(() => {
            //   setShowImportModal(true);
            // }, 2000);
            return;
          }

          AppToast.success('Image uploaded successfully');
          setShowImportModal(false);
        },
      },
    );
  };

  // const handleUploadImage = () => {
  //   if (!image) {
  //     AppToast.error('Please select image');
  //     return;
  //   }

  //   const formData = new FormData();

  //   formData.append('saleId', sale?.saleId);

  //   formData.append('images', {
  //     uri:
  //       Platform.OS === 'android'
  //         ? image.uri
  //         : image.uri?.replace('file://', ''),
  //     name: image.fileName || 'image.jpg',
  //     type: image.type || 'image/jpeg',
  //   } as any);

  //   mobileBulkUpload(
  //     {payload: formData},
  //     {
  //       onSuccess: res => {
  //         console.log('UPLOAD RESPONSE =>', res);

  //         const unmatched = res?.data?.unmatchedImages || [];

  //         if (unmatched.length > 0) {
  //           AppToast.error(`Image name not matched: ${unmatched.join(', ')}`);
  //           return; // ❗ stop success flow
  //         }

  //         // ✅ success case
  //         AppToast.success('Image uploaded successfully');
  //         setImage(null);
  //         setShowImportModal(false);
  //       },
  //     },
  //   );
  // };
  return (
    <View style={styles.container}>
      {/* App Header */}
      <AppHeader
        title="Catalog"
        subtitle={sale?.saleName || 'Select Sale'}
        leftIcon="chevron-back"
        onLeftPress={handleBack}
      />
      <Loader isLoading={isLoading || isUploadingImages} />
      {/* Header Section */}
      <View style={styles.headerSection}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Icon name="search-outline" size={ms(16)} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by lot, title..."
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={handleSearchChange}
          />
          <TouchableOpacity style={styles.filterBtn}>
            <Icon name="funnel-outline" size={ms(16)} color="primary" />
          </TouchableOpacity>
        </View>

        {/* Template and Items Count */}
        <View style={styles.templateRow}>
          <TouchableOpacity style={styles.templateDropdown}>
            <AppText
              title={`Template: ${selectedTemplate || 'Default'}`}
              fontySize="px12"
            />
            <Icon name="chevron-down-outline" size={ms(14)} color="#6B7280" />
          </TouchableOpacity>
          <AppText
            title={`${totalItems} items`}
            fontySize="px12"
            color="textSecondary"
          />
        </View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionBtn} onPress={handleAddLot}>
          <Icon name="add-outline" size={ms(20)} color="primary" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn}>
          <AppText title="CSV" fontySize="px8" color="primary" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={() => navigation.navigate(routes.lotImagesScreen)}>
          <Icon name="camera-outline" size={ms(20)} color="primary" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickActionBtn}
          onPress={handleDownlaod}>
          <Icon name="download-outline" size={ms(20)} color="primary" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickActionBtn}>
          <Icon name="print-outline" size={ms(20)} color="primary" />
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.contentArea}>
        {error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle-outline" size={ms(40)} color="error" />
            <AppText
              title="Failed to load catalog"
              fontySize="px14"
              color="error"
              marginTop={vs(8)}
            />
            <TouchableOpacity onPress={() => refetch()} style={styles.retryBtn}>
              <AppText title="Retry" fontySize="px12" color="primary" />
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={lots}
            renderItem={renderLotItem}
            keyExtractor={item => item._id}
            style={styles.lotsList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={
              lots.length === 0 ? styles.emptyListContent : styles.listContent
            }
            refreshControl={
              <RefreshControl
                refreshing={isLoading && !isFetching}
                onRefresh={refetch}
                colors={[colors.primary]}
              />
            }
            ListEmptyComponent={ListEmptyComponent}
            ListFooterComponent={ListFooterComponent}
          />
        )}
      </View>

      {/* Pagination Footer */}
      {!error && totalItems > 0 && (
        <View
          style={[styles.pagination, {paddingBottom: vs(12) + insets.bottom}]}>
          <AppText
            title={`Page ${page} of ${totalPages}`}
            fontySize="px12"
            color="textSecondary"
          />
          <View style={styles.paginationControls}>
            <TouchableOpacity
              style={styles.pageBtn}
              onPress={goToPrevPage}
              disabled={!hasPrevPage}>
              <Icon
                name="chevron-back-outline"
                size={ms(16)}
                color={hasPrevPage ? '#6B7280' : '#D1D5DB'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.pageBtn}
              onPress={goToNextPage}
              disabled={!hasNextPage}>
              <Icon
                name="chevron-forward-outline"
                size={ms(16)}
                color={hasNextPage ? '#6B7280' : '#D1D5DB'}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.perPageDropdown}
            onPress={changePerPage}>
            <AppText title={`Per Page: ${perPage}`} fontySize="px12" />
            <Icon name="chevron-down-outline" size={ms(14)} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}
      {showImportModal && (
        <AppModal
          visible={showImportModal}
          onClose={() => setShowImportModal(false)}
          position="center"
          containerStyle={{margin: 10}}>
          <ImportModalContent
            onClose={() => {
              setFile(null);
              setShowImportModal(false);
            }}
            onPickCSV={handlePickCSV}
            onSubmit={handleUploadCSV}
            file={file}
            isLoading={isPending}
            // ✅ add these
            image={image}
            onPickImage={handlePickImage}
            // onUploadImage={handleUploadImage}
          />
        </AppModal>
      )}
    </View>
  );
};

type ImportModalProps = {
  onClose: () => void;
  onPickCSV: () => void;
  onSubmit: () => void;
  file: FilePickerResult | null;
  isLoading: boolean;

  image: ImagePickerResult | null;
  onPickImage: () => void;
  onUploadImage?: () => void;
};

const ImportModalContent = ({
  onClose,
  onPickCSV,
  file,
  isLoading,
  onSubmit,
  image,
  onPickImage,
  onUploadImage,
}: ImportModalProps) => {
  return (
    <View style={styles.modalWrapper}>
      <View style={styles.modalHeader}>
        <AppText title="Import Sales" fontFamily="bold" fontySize="px14" />
        <TouchableOpacity onPress={onClose}>
          <Icon name="close" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <AppText title="Import CSV file" fontFamily="bold" fontySize="px12" />

        <TouchableOpacity style={styles.fileInput} onPress={onPickCSV}>
          <AppText
            title={file?.name || 'Choose CSV file'}
            fontySize="px14"
            color={file ? 'textPrimary' : 'textSecondary'}
          />

          <Icon
            name="cloud-upload-outline"
            size={16}
            color="#6B7280"
            style={{marginRight: ms(6)}}
          />
        </TouchableOpacity>

        <AppButton
          title={isLoading ? 'Uploading...' : 'Submit'}
          style={styles.addBtn}
          onPress={onSubmit}
          disabled={!file || isLoading}
        />

        {/* <AppText
          title="Download sample collection_sample_import.csv"
          fontySize="px10"
          color="primary"
          marginTop={vs(6)}
        /> */}
      </View>

      {/* Photo Section */}
      <View style={styles.card}>
        <AppText title="Import Photos" fontFamily="bold" fontySize="px12" />

        <View style={styles.infoBox}>
          <AppText
            title="NOTE: Photos should be named in accordance with settings for this Collection. Examples: 20256_1.jpg, 20256_2.jpg, 20256_3.jpg, ... etc."
            fontySize="px12"
            fontFamily="medium"
          />
        </View>

        <AppButton
          title="+ Add Photos"
          style={styles.addBtn}
          onPress={onPickImage}
        />
        {/* <AppButton
          title="Upload Image"
          style={styles.addBtn}
          onPress={onUploadImage}
        /> */}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerSection: {
    backgroundColor: colors.white,
    paddingHorizontal: ms(15),
    paddingTop: vs(10),
    paddingBottom: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: ms(12),
    paddingVertical: vs(8),
    borderRadius: 6,
    marginBottom: vs(10),
  },
  searchInput: {
    flex: 1,
    marginLeft: ms(8),
    fontSize: ms(12),
    color: '#1F2937',
    padding: 0,
  },
  filterBtn: {
    marginLeft: ms(8),
  },
  templateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    paddingVertical: vs(12),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  quickActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentArea: {
    flex: 1,
  },
  lotsList: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: ms(15),
    paddingVertical: vs(10),
  },
  emptyListContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ms(15),
  },
  lotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: ms(12),
    marginBottom: vs(8),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lotImagePlaceholder: {
    width: ms(50),
    height: ms(50),
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ms(12),
    overflow: 'hidden',
  },
  lotImage: {
    width: 120,
    height: 120,
  },
  lotContent: {
    flex: 1,
  },
  lotMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(4),
  },
  categoryTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: ms(6),
    paddingVertical: vs(2),
    borderRadius: 4,
    marginRight: ms(8),
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: ms(15),
    paddingTop: vs(12),
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paginationControls: {
    flexDirection: 'row',
    gap: ms(8),
  },
  pageBtn: {
    padding: ms(4),
  },
  perPageDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(4),
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(40),
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(20),
  },
  retryBtn: {
    marginTop: vs(12),
    paddingVertical: vs(8),
    paddingHorizontal: ms(16),
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  footerLoader: {
    paddingVertical: vs(16),
    alignItems: 'center',
  },
  modalWrapper: {},

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },

  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: ms(12),
    marginBottom: vs(12),
  },

  fileInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: vs(10),
    paddingHorizontal: ms(10),
    borderRadius: 6,
    marginTop: vs(8),
    justifyContent: 'space-between',
  },

  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: vs(10),
    borderRadius: 6,
    alignItems: 'center',
    marginTop: vs(10),
  },

  infoBox: {
    backgroundColor: '#E0F2FE',
    padding: vs(10),
    borderRadius: 6,
    marginTop: vs(8),
  },

  addBtn: {
    backgroundColor: colors.primary,
    paddingVertical: vs(10),
    borderRadius: 6,
    alignItems: 'center',
    marginTop: vs(10),
  },
});

export default CatalogScreen;
