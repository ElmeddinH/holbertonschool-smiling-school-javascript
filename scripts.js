$(document).ready(function () {
  // ========= Helper: build star row from rating (0-5) =========
  function buildStars(rating) {
    let stars = '';
    for (let i = 0; i < 5; i++) {
      const src = i < rating ? '/images/star_on.png' : '/images/star_off.png';
      stars += `<img src="${src}" alt="" width="15" height="15">`;
    }
    return stars;
  }

  // ========= Helper: build one video card =========
  function buildVideoCard(video) {
    return `
      <div class="card border-0">
        <img class="card-img-top" src="${video.thumb_url}" alt="thumbnail">
        <img class="play-img" src="/images/play.png" alt="" width="64" height="64">
        <div class="card-body">
          <h5 class="card-title font-weight-bold">${video.title}</h5>
          <p class="card-text text-muted">${video['sub-title'] || ''}</p>
          <p class="card-text">
            <img src="${video.author_pic_url}" alt="" width="30" height="30" class="rounded-circle">
            <small class="pl-2 font-weight-bold">${video.author}</small>
          </p>
          <div class="d-flex justify-content-between">
            <div class="stars d-flex justify-content-between">
              ${buildStars(video.star)}
            </div>
            <span class="text-primary">${video.duration}</span>
          </div>
        </div>
      </div>`;
  }

  // ========= Generic card-by-card carousel loader =========
  // Fills a carousel-inner with cards grouped responsively.
  // Uses Bootstrap carousel items; each item shows N cards based on viewport.
  function loadVideoCarousel(url, sectionSelector) {
    const section = $(sectionSelector);
    const inner = section.find('.carousel-inner');
    inner.html('<div class="loader"></div>');

    $.ajax({
      url: url,
      method: 'GET',
      success: function (videos) {
        inner.empty();

        // cards per slide based on width
        function cardsPerSlide() {
          const w = $(window).width();
          if (w < 576) return 1;
          if (w < 768) return 2;
          if (w < 992) return 3;
          return 4;
        }

        function render() {
          const per = cardsPerSlide();
          inner.empty();
          for (let i = 0; i < videos.length; i += per) {
            const group = videos.slice(i, i + per);
            const active = i === 0 ? ' active' : '';
            let cards = '';
            group.forEach(function (v) { cards += buildVideoCard(v); });
            inner.append(`<div class="carousel-item${active}"><div class="d-flex justify-content-center">${cards}</div></div>`);
          }
        }

        render();

        // re-render on resize (responsive)
        let resizeTimer;
        $(window).on('resize', function () {
          clearTimeout(resizeTimer);
          resizeTimer = setTimeout(render, 200);
        });
      }
    });
  }

  // ========= QUOTES (Task 1 / Task 4) =========
  const quotesContainer = $('.carousel-inner.bk-color');
  if (quotesContainer.length) {
    quotesContainer.html('<div class="loader"></div>');
    $.ajax({
      url: 'https://smileschool-api.hbtn.info/quotes',
      method: 'GET',
      success: function (data) {
        quotesContainer.empty();
        data.forEach(function (quote, index) {
          const active = index === 0 ? ' active' : '';
          quotesContainer.append(`
            <div class="carousel-item${active}">
              <div class="media">
                <div class="media-left pb-5">
                  <img src="${quote.pic_url}" width="150" height="150" class="rounded-circle d-block w-100">
                </div>
                <div class="media-body">
                  <p class="media-heading">« ${quote.text} »</p>
                  <p class="font-weight-bold">${quote.name}</p>
                  <p>${quote.title}</p>
                </div>
              </div>
            </div>`);
        });
      }
    });
  }

  // ========= POPULAR TUTORIALS (Task 2) =========
  if ($('#popular-tutorials').length) {
    loadVideoCarousel('https://smileschool-api.hbtn.info/popular-tutorials', '#popular-tutorials');
  }

  // ========= LATEST VIDEOS (Task 3) =========
  if ($('#latest-videos').length) {
    loadVideoCarousel('https://smileschool-api.hbtn.info/latest-videos', '#latest-videos');
  }
});
