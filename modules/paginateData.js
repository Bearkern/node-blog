const paginateData = (inputData, currentPage) => {
  const totalItems = inputData.length;
  const perpage = 3;
  const totalPages = Math.ceil(totalItems / perpage);

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  const minItem = (currentPage * perpage) - perpage + 1;
  const maxItem = (currentPage * perpage);

  console.log('總筆數:', totalItems, '每頁幾筆:', perpage, '總頁數:', totalPages, '每頁起始筆數:', minItem, '每頁結束筆數:', maxItem);

  const data = [];
  inputData.forEach((item, index) => {
    const itemNum = index + 1;
    if (itemNum >= minItem && itemNum <= maxItem) {
      data.push(item);
    }
  });

  const page = {
    totalPages,
    currentPage,
    hasPrev: currentPage > 1,
    hasNext: currentPage < totalPages,
  };

  return { page, data };
}

module.exports = paginateData;