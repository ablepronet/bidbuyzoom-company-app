import React, {useEffect, useMemo, useState} from 'react';
import {
  Modal,
  Pressable,
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
import {useGetTemplete} from '../../../services/queries/app/sales/useGetTemplete';

const templateOptions = [
  'Online Changed',
  'lop',
  'abbjd nbs',
  'tytyy',
  'rains',
  'rtyuiop',
  'fdst',
  'Online 2',
];

const AddSaleTemplateScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const saleId = route.params?.saleId;
  const selectedSale = route.params?.selectedSale || null;
  const {data: templateListResponse} = useGetTemplete(saleId);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [isPickerVisible, setPickerVisible] = useState(false);

  useEffect(() => {
    if (templateListResponse) {
      console.log('template-list response', templateListResponse);
    }
  }, [templateListResponse]);

  const hubSale = useMemo(
    () => ({
      ...(selectedSale || {}),
      saleId: saleId || selectedSale?._id || selectedSale?.saleId,
      templateName: selectedTemplate,
    }),
    [saleId, selectedSale, selectedTemplate],
  );

  const handleSubmit = () => {
    navigation.navigate(routes.saleHubScreen, {
      saleId: hubSale.saleId,
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
              title={selectedTemplate || 'Select Template'}
              fontySize="px14"
              color={selectedTemplate ? 'textPrimary' : 'textSecondary'}
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
              !selectedTemplate && styles.submitButtonDisabled,
            ]}
            disabled={!selectedTemplate}
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
            {templateOptions.map(option => (
              <TouchableOpacity
                key={option}
                activeOpacity={0.85}
                style={styles.optionRow}
                onPress={() => {
                  setSelectedTemplate(option);
                  setPickerVisible(false);
                }}>
                <AppText title={option} fontySize="px14" />
                {selectedTemplate === option ? (
                  <Icon name="checkmark" size={ms(20)} color={colors.primary} />
                ) : null}
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
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
