export const deleteCard = (cardElement) => cardElement.remove();

const getTemplate = () => {
  return document
    .getElementById('card-template')
    .content.querySelector('.card')
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeToggle, onDeleteCard },
  currentUserId
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector('.card__like-button');
  const deleteButton = cardElement.querySelector('.card__control-button_type_delete');
  const cardImage = cardElement.querySelector('.card__image');
  const likeCountElement = cardElement.querySelector('.card__like-count');

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector('.card__title').textContent = data.name;

  if (likeCountElement)
    likeCountElement.textContent = data.likes ? data.likes.length : 0;

  const isLiked = data.likes && data.likes.some((user) => user._id === currentUserId);

  if (isLiked) likeButton.classList.add('card__like-button_is-active');

  if (data.owner && data.owner._id !== currentUserId) {
    if (deleteButton) deleteButton.remove();
  }

  else if (onDeleteCard)
    deleteButton.addEventListener('click', () => onDeleteCard(cardElement, data._id));

  likeButton.addEventListener('click', () => {
    const currentlyLiked = likeButton.classList.contains('card__like-button_is-active');

    onLikeToggle(data._id, currentlyLiked)
      .then((updatedCard) => {
        likeButton.classList.toggle(
          'card__like-button_is-active',
          updatedCard.likes.some((user) => user._id === currentUserId)
        );

        if (likeCountElement) likeCountElement.textContent = updatedCard.likes.length;
      })
      .catch((err) => console.log(err));
  });

  if (onPreviewPicture)
    cardImage.addEventListener('click', () => onPreviewPicture({ name: data.name, link: data.link }));

  return cardElement;
};
