document.addEventListener("DOMContentLoaded", function() {
  const carousel = document.getElementById('vegp-carousel');
  const images = carousel.querySelectorAll('img.vegp-lazy');
  const leftArrow = carousel.querySelector('.vegp-arrow-left');
  const rightArrow = carousel.querySelector('.vegp-arrow-right');

  let currentIndex = 0;

  // Lazy load helper
  function lazyLoadImage(img) {
    if (!img.src) {
      img.src = img.getAttribute('data-src');
    }
  }

  // Show image by index
  function showImage(index) {
    if (index < 0) index = images.length - 1;
    if (index >= images.length) index = 0;

    images.forEach((img, i) => {
      if (i === index) {
        lazyLoadImage(img);
        img.classList.add('vegp-active');
      } else {
        img.classList.remove('vegp-active');
      }
    });
    currentIndex = index;
  }

  leftArrow.addEventListener('click', () => {
    showImage(currentIndex - 1);
  });

  rightArrow.addEventListener('click', () => {
    showImage(currentIndex + 1);
  });

  // Initialize first image lazy load
  lazyLoadImage(images[0]);
});