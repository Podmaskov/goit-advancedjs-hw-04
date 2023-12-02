import SimpleLightbox from 'simplelightbox';
import iziToast from 'izitoast';
import { getPictures } from './api';

import 'simplelightbox/dist/simple-lightbox.min.css';
import 'izitoast/dist/css/iziToast.min.css';

const TOAST_DEFAULT_OPTIONS = {
  position: 'topRight',
  messageColor: '#fff',
};

const formElement = document.querySelector('.search-form');
const galleryWrapElement = document.querySelector('.gallery');
const loaderElement = document.querySelector('.loader');

let searchQuery = '';
let totalPictures = 0;
let page = 1;

formElement.addEventListener('submit', async event => {
  event.preventDefault();
  const inputValue = event.target.elements.searchQuery.value
    .toLowerCase()
    .trim();

  if (!inputValue) return;
  searchQuery = inputValue;
  page = 1;
  event.target.elements.searchQuery.value = '';
  galleryWrapElement.innerHTML = '';
  loaderElement.classList.remove('hide');
  try {
    const { hits: pictures, total } = await getPictures({ searchQuery, page });
    if (!pictures.length) {
      iziToast.show({
        ...TOAST_DEFAULT_OPTIONS,
        message: `We're sorry, but images to your request didn't find.`,
        color: '#ef5350',
      });
    }
    totalPictures = total;
    renderGallery(createListOfPictures(pictures), true);
    iziToast.show({
      ...TOAST_DEFAULT_OPTIONS,
      message: `Hooray! We found ${totalPictures} images.`,
      color: '#7dc67d',
    });
  } catch (error) {
    console.error('Error!!!!', error);
  } finally {
    loaderElement.classList.add('hide');
  }
});

function renderGallery(picturesTemplate, isNewSearch = false) {
  if (galleryWrapElement.lastElementChild) {
    io.unobserve(galleryWrapElement.lastElementChild);
  }
  isNewSearch
    ? (galleryWrapElement.innerHTML = picturesTemplate)
    : galleryWrapElement.insertAdjacentHTML('beforeend', picturesTemplate);

  io.observe(galleryWrapElement.lastElementChild);
  new SimpleLightbox('.gallery a', {
    captionSelector: 'img',
    captionsData: 'alt',
    captionDelay: 250,
  });
}

function createListOfPictures(pictures) {
  return pictures
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
        <li class="photo-card">
          <a href="${largeImageURL}">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" height="220" />
            </a>
            <div class="info">
              <p class="info-item"><b>Likes</b> ${likes}</p>
              <p class="info-item"><b>Views</b> ${views}</p>
              <p class="info-item"><b>Comments</b> ${comments}</p>
              <p class="info-item"><b>Downloads</b> ${downloads}</p>
            </div>
        </li>
  `
    )
    .join('');
}

async function loadNextPictures() {
  page += 1;
  const { hits: pictures } = await getPictures({ searchQuery, page });
  return pictures;
}

const io = new IntersectionObserver(async entries => {
  const picturesRendered = galleryWrapElement.childElementCount;
  if (entries[0].intersectionRatio <= 0 || picturesRendered === totalPictures) {
    return;
  }
  try {
    const pictures = await loadNextPictures();
    renderGallery(createListOfPictures(pictures));
  } catch (error) {
    console.error('observer error', error);
  }
});
