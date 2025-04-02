// config.ts
const BASE_URL = import.meta.env.VITE_API_URL;

export const getImageUrl = (imagePath: string) => {
  return `${BASE_URL}/${imagePath}`;
};