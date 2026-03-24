import {Dimensions} from 'react-native';

const {width: W, height: H} = Dimensions.get('window');

const BW = 375;
const BH = 812;

export const scale = (size: number): number => (W / BW) * size;

export const vs = (size: number): number => (H / BH) * size;

export const ms = (size: number, factor: number = 0.5): number =>
  size + (scale(size) - size) * factor;

export const mvs = (size: number, factor: number = 0.5): number =>
  size + (vs(size) - size) * factor;
