import axios from 'axios';
const API_KEY = '2573416-853329f61ff5a3b6beba25569';
const BASE_URL = 'https://pixabay.com/api/';

const fetchPictures = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

export async function getPictures({ searchQuery, page }) {
  const data = await fetchPictures.get('/', {
    params: {
      key: API_KEY,
      q: searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page,
      per_page: 40,
    },
  });
  return data.data;
}
