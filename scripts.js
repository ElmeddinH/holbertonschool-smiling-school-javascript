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

  // ========= COURSES (Task 5) =========
  if ($('.search-result').length) {
    const state = { q: '', topic: 'all', sort: 'most_popular' };

    function capitalize(s) {
      return s.replace(/_/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
    }

    function buildCourseCard(course) {
      let stars = '';
      for (let i = 0; i < 5; i++) {
        const src = i < course.star ? './images/star_on.png' : './images/star_off.png';
        stars += `<img src="${src}" width="15" height="15" alt="">`;
      }
      return `
        <div class="card col-md-3 col-sm-4 col-12 my-3" style="width: 16rem;">
          <div class="d-flex align-items-center justify-content-center">
            <img src="${course.thumb_url}" class="card-img-top" alt="thumbnail" />
            <img src="./images/play.png" class="position-absolute iconPlay" alt="play" />
          </div>
          <div class="card-body">
            <h5 class="card-title font-weight-bold text-left">${course.title}</h5>
            <p class="card-text text-muted text-left">${course['sub-title'] || ''}</p>
            <div class="d-flex align-items-center">
              <img src="${course.author_pic_url}" alt="author" width="30" height="30" class="rounded-circle">
              <h6 class="pl-2 m-0 text-purple">${course.author}</h6>
            </div>
            <div class="d-flex align-items-center justify-content-between mt-3">
              <div class="d-flex">${stars}</div>
              <span class="text-purple">${course.duration}</span>
            </div>
          </div>
        </div>`;
    }

    function fetchCourses() {
      const results = $('.search-result');
      results.html('<div class="loader mx-auto my-5"></div>');
      $.ajax({
        url: 'https://smileschool-api.hbtn.info/courses',
        method: 'GET',
        data: { q: state.q, topic: state.topic, sort: state.sort },
        success: function (data) {
          // update results count
          $('p.text-secondary').first().text(data.courses.length + ' videos');
          results.empty();
          data.courses.forEach(function (course) {
            results.append(buildCourseCard(course));
          });
        }
      });
    }

    // Populate dropdowns + init search once on first load
    $.ajax({
      url: 'https://smileschool-api.hbtn.info/courses',
      method: 'GET',
      success: function (data) {
        // init search value
        $('#key-search').val(data.q);
        state.q = data.q;

        // TOPIC dropdown
        const topicMenu = $('#topic').closest('.input-box').find('.dropdown-menu');
        topicMenu.empty();
        data.topics.forEach(function (t) {
          topicMenu.append(`<a class="dropdown-item" data-value="${t}">${capitalize(t)}</a>`);
        });
        $('#topic').text(capitalize(data.topic));
        state.topic = data.topic;

        // SORT dropdown
        const sortMenu = $('#sortby').closest('.input-box').find('.dropdown-menu');
        sortMenu.empty();
        data.sorts.forEach(function (s) {
          sortMenu.append(`<a class="dropdown-item" data-value="${s}">${capitalize(s)}</a>`);
        });
        $('#sortby').text(capitalize(data.sort));
        state.sort = data.sort;

        // initial course render
        $('p.text-secondary').first().text(data.courses.length + ' videos');
        const results = $('.search-result');
        results.empty();
        data.courses.forEach(function (course) {
          results.append(buildCourseCard(course));
        });

        // ---- events ----
        topicMenu.on('click', '.dropdown-item', function () {
          state.topic = $(this).data('value');
          $('#topic').text($(this).text());
          fetchCourses();
        });

        sortMenu.on('click', '.dropdown-item', function () {
          state.sort = $(this).data('value');
          $('#sortby').text($(this).text());
          fetchCourses();
        });

        let searchTimer;
        $('#key-search').on('input', function () {
          state.q = $(this).val();
          clearTimeout(searchTimer);
          searchTimer = setTimeout(fetchCourses, 300);
        });
      }
    });
  }
});