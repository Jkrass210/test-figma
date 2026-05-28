export function video() {
  const videoBlocks = document.querySelectorAll(".box-video");

  videoBlocks.forEach((block) => {
    const videoSrc = block.dataset.video;

    if (!videoSrc) return;

    const onClick = () => {
      // Создаём элемент <video>
      const videoEl = document.createElement("video");
      videoEl.src = videoSrc;
      videoEl.controls = true;
      videoEl.autoplay = true;
      videoEl.playsInline = true; // важно для мобилок
      videoEl.style.width = "100%";
      videoEl.style.height = "100%";

      // Вставляем в конец контейнера
      block.appendChild(videoEl);

      // Запускаем со звуком
      videoEl.muted = false;
      videoEl.play().catch((err) => {
        console.warn("Видео не удалось воспроизвести автоматически:", err);
      });

      // Убираем обработчик, чтобы клик больше не срабатывал
      block.removeEventListener("click", onClick);
    };

    block.addEventListener("click", onClick);
  });
}