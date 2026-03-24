import { Platform } from "react-native";
import { mvs, s } from "react-native-size-matters/extend";

export const fontSizes = {
  px8: mvs(8),
  px10: mvs(10),
  px12: mvs(12),
  px14: mvs(14),
  px16: mvs(16),
  px18: mvs(18),
  px20: mvs(20),
  px22: mvs(22),
  px24: mvs(24),
  px26: mvs(26),
  px28: mvs(28),
  px30: mvs(30),
  px32: mvs(32),
  px36: mvs(36),
  px40: mvs(40),  
};

export const paddingHorizontal = s(20);


export const logs = (...args: any) => {
  console.log(Platform.OS, ...args);
};