import React, {useEffect, useMemo, useState} from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AppHeader from '../../../components/appHeader';
import {AppText} from '../../../components/AppText';
import {colors} from '../../../constants';
import {routes} from '../../../navigation/route';
import {ms, scale, vs} from '../../../utils/responsive';
import {
  TemplateListItem,
  useGetTemplete,
  useUpdateSaleTemplate,
} from '../../../services/queries/app/sales/useGetTemplete';
import Loader from '../../../components/loader';
import AppToast from '../../../components/toaster';

const AddSaleTemplateScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const saleId = route.params?.saleId;
  const selectedSale = route.params?.selectedSale || null;
  const currentSaleId = saleId || selectedSale?._id || selectedSale?.saleId;
  const {
    data: templateListResponse,
    isLoading: isTemplateLoading,
    isError: isTemplateError,
  } = useGetTemplete(currentSaleId);
  const updateSaleTemplateMutation = useUpdateSaleTemplate();
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isPickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (templateListResponse) {
      console.log('template-list response', templateListResponse);
    }
  }, [templateListResponse]);

  useEffect(() => {
    if (!selectedSale?.templateId) return;

    navigation.replace(routes.catalogScreen, {
      sale: {
        ...selectedSale,
        saleId: currentSaleId,
        templateId: selectedSale.templateId,
      },
    });
  }, [currentSaleId, navigation, selectedSale]);

  const templateOptions = useMemo<TemplateListItem[]>(
    () => templateListResponse?.data || [],
    [templateListResponse?.data],
  );

  const selectedTemplate = useMemo(
    () => templateOptions.find(item => item._id === selectedTemplateId),
    [selectedTemplateId, templateOptions],
  );

  const hubSale = useMemo(
    () => ({
      ...(selectedSale || {}),
      saleId: currentSaleId,
      templateId: selectedTemplateId || selectedSale?.templateId,
      templateName: selectedTemplate?.templateName,
    }),
    [currentSaleId, selectedSale, selectedTemplate, selectedTemplateId],
  );

  const handleSubmit = async () => {
    if (!currentSaleId) {
      AppToast.error('Sale id is missing');
      return;
    }
    if (!selectedTemplateId) {
      AppToast.error('Please select template');
      return;
    }

    try {
      const response = await updateSaleTemplateMutation.mutateAsync({
        saleId: currentSaleId,
        templateId: selectedTemplateId,
      });
      console.log(response, 'response=================================');
    } catch (error) {
      console.log('Update sale template failed', error);
      return;
    }

    navigation.navigate(routes.saleHubScreen, {
      saleId: currentSaleId,
      selectedSale: hubSale,
      fromAddSaleFlow: true,
    });
  };

  return (
    <View style={styles.container}>
      <AppHeader
        leftIcon="chevron-back"
        onLeftPress={() => navigation.goBack()}
        title="Template"
        showBorder={false}
      />

      <View style={styles.content}>
        <View style={styles.row}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.select}
            onPress={() => setPickerVisible(true)}>
            <AppText
              title={selectedTemplate?.templateName || 'Select Template'}
              fontySize="px14"
              color={selectedTemplateId ? 'textPrimary' : 'textSecondary'}
            />
            <Icon
              name="chevron-down"
              size={ms(18)}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.submitButton,
              (!selectedTemplateId || updateSaleTemplateMutation.isPending) &&
                styles.submitButtonDisabled,
            ]}
            disabled={
              !selectedTemplateId || updateSaleTemplateMutation.isPending
            }
            onPress={handleSubmit}>
            <AppText
              title="Submit"
              fontySize="px14"
              fontFamily="bold"
              color="textLight"
            />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={isPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}>
        <Pressable
          style={styles.overlay}
          onPress={() => setPickerVisible(false)}>
          <Pressable style={styles.sheet}>
            <AppText
              title="Select Template"
              fontySize="px18"
              fontFamily="bold"
              marginBottom={vs(12)}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
              {isTemplateLoading ? (
                <AppText
                  title="Loading templates..."
                  fontySize="px14"
                  color="textSecondary"
                />
              ) : templateOptions.length ? (
                templateOptions.map(option => (
                  <TouchableOpacity
                    key={option._id}
                    activeOpacity={0.85}
                    style={styles.optionRow}
                    onPress={() => {
                      setSelectedTemplateId(option._id);
                      setPickerVisible(false);
                    }}>
                    <AppText title={option.templateName} fontySize="px14" />
                    {selectedTemplateId === option._id ? (
                      <Icon
                        name="checkmark"
                        size={ms(20)}
                        color={colors.primary}
                      />
                    ) : null}
                  </TouchableOpacity>
                ))
              ) : (
                <AppText
                  title={
                    isTemplateError
                      ? 'Unable to load templates'
                      : 'No templates available'
                  }
                  fontySize="px14"
                  color={isTemplateError ? 'error' : 'textSecondary'}
                />
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
      <Loader
        isLoading={isTemplateLoading || updateSaleTemplateMutation.isPending}
        transparent={!isTemplateLoading}
      />
    </View>
  );
};

export default AddSaleTemplateScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: ms(16),
    paddingBottom: vs(120),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
  },
  select: {
    flex: 1,
    minHeight: vs(48),
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: ms(6),
    backgroundColor: colors.white,
    paddingHorizontal: scale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  submitButton: {
    minHeight: vs(48),
    minWidth: scale(92),
    borderRadius: ms(8),
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(14),
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: ms(18),
    borderTopRightRadius: ms(18),
    paddingHorizontal: ms(18),
    paddingTop: vs(18),
    paddingBottom: vs(24),
    maxHeight: '70%',
  },
  optionRow: {
    minHeight: vs(46),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
