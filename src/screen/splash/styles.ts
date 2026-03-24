import {StyleSheet} from 'react-native';
import colors from '../../constants/colors';
import {scale, vs} from '../../utils/responsive';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: scale(180),
    height: vs(180),
  },
  centerLogoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: vs(60),
  },

  bottomTextContainer: {
    paddingBottom: vs(40),
    alignItems: 'center',
  },
});
