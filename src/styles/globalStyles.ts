import {StyleSheet} from 'react-native';
import colors from '../constants/colors';
import {scale, vs} from '../utils/responsive';

const globalStyles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: colors.background,
    marginBottom:vs(10),
  },
  innerWrapper: {
    flex: 1,
    backgroundColor: colors.lightBackground,
    paddingHorizontal: scale(15),
  },
  shadowContainer: {
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
    backgroundColor: '#fff',
    borderRadius: vs(20),
    padding: vs(10),
  },
  appShadow: {
    shadowColor: '#E2E2E2',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 2,
    backgroundColor: '#fff',
  },
  icon: {
    width: scale(25),
    height: scale(25),
  },
  content: {
    paddingHorizontal: scale(15),
    flexGrow: 1,
  },
  contentContainer: {
    paddingBottom: vs(50),
    flexGrow: 1,
    marginTop: vs(15),
  },
   paddinBottom:{paddingBottom: vs(20)}
});

export default globalStyles;
