import { createCardElement, deleteCard } from './components/card.js';
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from './components/modal.js';
import { enableValidation, clearValidation } from './components/validation.js';
import { getUserInfo, getCardList, setUserInfo, setUserAvatar, addCard, deleteCard as deleteCardApi, changeLikeCardStatus } from './components/api.js';

const placesWrap = document.querySelector('.places__list');

const profileFormModalWindow = document.querySelector('.popup_type_edit');
const profileForm = profileFormModalWindow.querySelector('.popup__form');
const profileTitleInput = profileForm.querySelector('.popup__input_type_name');
const profileDescriptionInput = profileForm.querySelector('.popup__input_type_description');

const cardFormModalWindow = document.querySelector('.popup_type_new-card');
const cardForm = cardFormModalWindow.querySelector('.popup__form');
const cardNameInput = cardForm.querySelector('.popup__input_type_card-name');
const cardLinkInput = cardForm.querySelector('.popup__input_type_url');

const imageModalWindow = document.querySelector('.popup_type_image');
const imageElement = imageModalWindow.querySelector('.popup__image');
const imageCaption = imageModalWindow.querySelector('.popup__caption');

const openProfileFormButton = document.querySelector('.profile__edit-button');
const openCardFormButton = document.querySelector('.profile__add-button');

const profileTitle = document.querySelector('.profile__title');
const profileDescription = document.querySelector('.profile__description');
const profileAvatar = document.querySelector('.profile__image');

const avatarFormModalWindow = document.querySelector('.popup_type_edit-avatar');
const avatarForm = avatarFormModalWindow.querySelector('.popup__form');
const avatarInput = avatarForm.querySelector('.popup__input');

const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

const renderLoading = (button, isLoading, defaultText) => {
  button.textContent = isLoading ? 'Сохранение...' : defaultText;
};

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;

  openModalWindow(imageModalWindow);
};

const handleDeleteCard = (cardElement, cardId) => {
  deleteCardApi(cardId)
    .then(() => deleteCard(cardElement))
    .catch((err) => console.log(err));
};

const handleLikeToggle = (cardId, isLiked) => changeLikeCardStatus(cardId, isLiked);

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = profileForm.querySelector('.popup__button');

  renderLoading(submitButton, true, 'Сохранить');

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => console.log(err))
    .finally(() => renderLoading(submitButton, false, 'Сохранить'));
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = avatarForm.querySelector('.popup__button');

  renderLoading(submitButton, true, 'Сохранить');

  setUserAvatar({ avatar: avatarInput.value })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => console.log(err))
    .finally(() => renderLoading(submitButton, false, 'Сохранить'));
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = cardForm.querySelector('.popup__button');

  submitButton.textContent = 'Создание...';

  addCard({ name: cardNameInput.value, link: cardLinkInput.value })
    .then((newCard) => {
      placesWrap.prepend(
        createCardElement(
          newCard,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeToggle: handleLikeToggle,
            onDeleteCard: handleDeleteCard
          },
          window.currentUserId
        )
      );

      cardForm.reset();

      clearValidation(cardForm, validationConfig);
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => console.log(err))
    .finally(() => (submitButton.textContent = 'Создать'));
};

profileForm.addEventListener('submit', handleProfileFormSubmit);
cardForm.addEventListener('submit', handleCardFormSubmit);
avatarForm.addEventListener('submit', handleAvatarFormSubmit);

openProfileFormButton.addEventListener('click', () => {
  clearValidation(profileForm, validationConfig);

  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;

  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener('click', () => {
  avatarForm.reset();

  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener('click', () => {
  cardForm.reset();

  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

const allPopups = document.querySelectorAll('.popup');

allPopups.forEach((popup) => setCloseModalWindowEventListeners(popup));

enableValidation(validationConfig);

Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    window.currentUserId = userData._id;

    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(
          cardData,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeToggle: handleLikeToggle,
            onDeleteCard: handleDeleteCard,
          },
          userData._id
        )
      );
    });
  })
  .catch((err) => console.log(err));
