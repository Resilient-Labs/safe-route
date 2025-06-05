const filterTabs = document.querySelectorAll('.post-category-container li');
const posts = Array.from(document.querySelectorAll('.post-item')); //convert NodeList to an array
let selectedTab = 'all'; // Track currently selected category

// Haversine formula JavaScript implementation (calculates the great-circle distance between two points on a sphere (like Earth) given their latitudes and longitudes)
function getDistance(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in kilometers

  //Distance between latitude and longitude
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in kilometers
}

// Reorder posts in DOM
function updateDOMOrder(sortedPosts) {
  const container = document.getElementById('posts-list');
  container.innerHTML = ''; // Clear all posts from DOM
  sortedPosts.forEach((post) => container.appendChild(post)); // Append posts in sorted order
}

// Filter by category
function applyTypeFilter() {
  posts.forEach((post) => {
    const postType = post.dataset.type;
    const shouldShow = selectedTab === 'all' || postType === selectedTab;
    post.style.display = shouldShow ? 'block' : 'none';
  });
}

function applyBookmarkFilter() {
  posts.forEach((post) => {
    const postBookmark = post.dataset.bookmarked;
    const shouldShow = selectedTab === 'all' || postBookmark === selectedTab;
    post.style.display = shouldShow ? 'block' : 'none';
  });
}

// Category tab click handler
filterTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    selectedTab = tab.getAttribute('data-filter');
    if (selectedTab === 'bookmarked') {
      applyBookmarkFilter();
    } else {
      applyTypeFilter();
    }
  });
});
