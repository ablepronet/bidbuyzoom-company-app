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

const MAX_LOG_LENGTH = 800;

const normalizeLogValue = (value: any) => {
  if (value === null || value === undefined) {
    return value;
  }

  if (typeof value === 'string') {
    return value.length > MAX_LOG_LENGTH
      ? `${value.slice(0, MAX_LOG_LENGTH)}... [truncated]`
      : value;
  }

  if (typeof FormData !== 'undefined' && value instanceof FormData) {
    return '[FormData]';
  }

  if (value instanceof Error) {
    return value.message;
  }

  if (typeof value === 'object') {
    try {
      const serialized = JSON.stringify(value);
      return serialized.length > MAX_LOG_LENGTH
        ? `${serialized.slice(0, MAX_LOG_LENGTH)}... [truncated]`
        : serialized;
    } catch {
      return '[Object]';
    }
  }

  return value;
};

export const logs = (...args: any) => {
  if (Platform.OS === 'ios') {
    return;
  }

  console.log(Platform.OS, ...args.map(normalizeLogValue));
};
