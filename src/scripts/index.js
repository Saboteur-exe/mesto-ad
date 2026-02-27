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

const removeCardModalWindow = document.querySelector('.popup_type_remove-card');
const removeCardForm = removeCardModalWindow.querySelector('.popup__form');

const infoModalWindow = document.querySelector('.popup_type_info');
const logo = document.querySelector('.header__logo');

const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

const renderLoading = (button, isLoading, defaultText) => button.textContent = isLoading ? 'Сохранение...' : defaultText;

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;

  openModalWindow(imageModalWindow);
};

let cardToDelete = null;
let cardElementToDelete = null;

const handleDeleteCard = (cardElement, cardId) => {
  cardToDelete = cardId;
  cardElementToDelete = cardElement;

  openModalWindow(removeCardModalWindow);
};

removeCardForm.addEventListener('submit', (evt) => {
  evt.preventDefault();

  const submitButton = removeCardForm.querySelector('.popup__button');
  submitButton.textContent = 'Удаление...';

  deleteCardApi(cardToDelete)
    .then(() => {
      deleteCard(cardElementToDelete);
      closeModalWindow(removeCardModalWindow);
      cardToDelete = null;
      cardElementToDelete = null;
    })
    .catch((err) => console.log(err))
    .finally(() => (submitButton.textContent = 'Да'));
});

const handleLikeToggle = (cardId, isLiked) => changeLikeCardStatus(cardId, isLiked);

const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      const infoTitle = infoModalWindow.querySelector('.popup__title');
      const infoDl = infoModalWindow.querySelector('.popup__info');
      const infoSubtitle = infoModalWindow.querySelector('.popup__text');
      const infoList = infoModalWindow.querySelector('.popup__list');

      infoDl.innerHTML = '';
      infoList.innerHTML = '';

      const defTemplate = document.getElementById('popup-info-definition-template');
      const userTemplate = document.getElementById('popup-info-user-preview-template');

      infoTitle.textContent = 'Статистика карточек';

      const uniqueUsers = [...new Map(cards.map((c) => [c.owner._id, c.owner])).values()];

      const usersItem = defTemplate.content.cloneNode(true);
      usersItem.querySelector('.popup__info-term').textContent = 'Всего пользователей:';
      usersItem.querySelector('.popup__info-description').textContent = uniqueUsers.length;
      
      infoDl.append(usersItem);

      const totalLikes = cards.reduce((sum, c) => sum + c.likes.length, 0);
      const likesItem = defTemplate.content.cloneNode(true);
      
      likesItem.querySelector('.popup__info-term').textContent = 'Всего лайков:';
      likesItem.querySelector('.popup__info-description').textContent = totalLikes;
      
      infoDl.append(likesItem);

      const likesByUser = {};

      cards.forEach((card) => {
        card.likes.forEach((user) => {
          likesByUser[user._id] = (likesByUser[user._id] || { count: 0, name: user.name });
          likesByUser[user._id].count += 1;
          likesByUser[user._id].name = user.name;
        });
      });

      const userLikesArray = Object.values(likesByUser);
      const maxLikes = userLikesArray.length > 0 ? Math.max(...userLikesArray.map((u) => u.count)) : 0;
      const champion = userLikesArray.find((u) => u.count === maxLikes);

      const maxLikesItem = defTemplate.content.cloneNode(true);
      maxLikesItem.querySelector('.popup__info-term').textContent = 'Максимально лайков от одного:';
      maxLikesItem.querySelector('.popup__info-description').textContent = maxLikes;
      
      infoDl.append(maxLikesItem);

      const championItem = defTemplate.content.cloneNode(true);
      championItem.querySelector('.popup__info-term').textContent = 'Чемпион лайков:';
      championItem.querySelector('.popup__info-description').textContent = champion ? champion.name : '—';
      
      infoDl.append(championItem);

      infoSubtitle.textContent = 'Популярные карточки:';

      const topCards = [...cards].sort((a, b) => b.likes.length - a.likes.length).slice(0, 3);
  
      topCards.forEach((card) => {
        const userItem = userTemplate.content.cloneNode(true);
        const li = userItem.querySelector('.popup__list-item_type_badge');

        li.textContent = card.name;
        infoList.append(userItem);
      });

      openModalWindow(infoModalWindow);
    })
    .catch((err) => console.log(err));
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = profileForm.querySelector('.popup__button');

  renderLoading(submitButton, true, 'Сохранить');

  setUserInfo({ name: profileTitleInput.value, about: profileDescriptionInput.value })
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
        createCardElement(newCard, {
          onPreviewPicture: handlePreviewPicture,
          onLikeToggle: handleLikeToggle,
          onDeleteCard: handleDeleteCard,
        }, window.currentUserId)
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

logo.addEventListener('click', handleLogoClick);

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
        createCardElement(cardData, {
          onPreviewPicture: handlePreviewPicture,
          onLikeToggle: handleLikeToggle,
          onDeleteCard: handleDeleteCard,
        }, userData._id)
      );
    });
  })
  .catch((err) => console.log(err));
