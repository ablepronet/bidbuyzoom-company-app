import {useTranslation} from 'react-i18next';

export const useAppTranslation = () => {
  const {t} = useTranslation();
  return t;
};
