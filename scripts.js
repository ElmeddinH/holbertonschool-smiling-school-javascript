$(document).ready(function () {
  // ===== QUOTES (Task 1 / Task 4) =====
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
          const item = `
            <div class="carousel-item${active}">
              <div class="media">
                <div class="media-left pb-5">
                  <img src="${quote.pic_url}" width="150" height="150" class="rounded-circle d-block w-100">
                </div>
                <div class="media-body">
                  <p class="media-heading">« ${quote.text} »</p>
                  <p>${quote.name}</p>
                  <p>${quote.title}</p>
                </div>
              </div>
            </div>`;
          quotesContainer.append(item);
        });
      }
    });
  }
});
