import { IMAGE_BASE_URL } from "../constants/apiConstant";

export const getImageUri = (path?: string | null) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${IMAGE_BASE_URL}${path}`;
};