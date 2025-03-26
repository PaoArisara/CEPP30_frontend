// config.ts
const BASE_URL = "http://localhost:3000";

export const getImageUrl = (imagePath: string) => {
  return `${BASE_URL}/${imagePath}`;
};