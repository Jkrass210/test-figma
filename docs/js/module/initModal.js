export function initModal() {
  const modals = document.querySelectorAll('.modal');
  const openButtons = document.querySelectorAll('.js-open-modal');
  const closeButtons = document.querySelectorAll('.js-close-modal');
  console.log('openButtons:', openButtons.length);

  function openModal(modalId) {
    closeModal();

    const modal = document.getElementById(modalId);
    if (!modal) return;

    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarWidth > 0) {
      //document.body.style.paddingRight = scrollBarWidth + 'px';
    }

    modal.classList.add('show');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    modals.forEach(function (modal) {
      modal.classList.remove('show');
    });

    document.body.classList.remove('modal-open');
    document.body.style.paddingRight = '';
  }

  // Открытие
  openButtons.forEach(function (button) {
    button.addEventListener('click', function (e) {
      e.preventDefault()
      const modalId = button.getAttribute('data-modal');
      if (modalId) {
        openModal(modalId);
      }
    });
  });

  // Закрытие по кнопке
  closeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      closeModal();
    });
  });

  // Закрытие по клику на оверлей
  modals.forEach(function (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  });

  // Закрытие по Esc
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      closeModal();
    }
  });

  // если нужно дергать извне
  window.modal = {
    open: openModal,
    close: closeModal
  };
}
