const filterTabs = document.querySelectorAll('.post-category-container li');
const filterSelect = document.getElementById('filter-select');
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

// Sort handler
filterSelect.addEventListener('change', () => {
  const selectedFilter = filterSelect.value;

  if (selectedFilter === 'recent') {
    // Sort by newest post first
    posts.sort((a, b) => {
      return Number(b.dataset.created) - Number(a.dataset.created);
    });
    updateDOMOrder(posts);
  }

  if (selectedFilter === 'nearMe') {
    // If geolocation isn’t supported, show an alert and exit
    if (!navigator.geolocation) {
      alert('Geolocation is not supported in your browser');
      return;
    }

    //Fetch coordinates asynchronously
    navigator.geolocation.getCurrentPosition((position) => {
      console.log('User position:', position);
      // Coordinates of the user
      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // Sorts posts by distance to user
      posts.sort((a, b) => {
        const distA = getDistance(
          userLat,
          userLng,
          Number(a.dataset.lat),
          Number(a.dataset.lng)
        );
        const distB = getDistance(
          userLat,
          userLng,
          Number(b.dataset.lat),
          Number(b.dataset.lng)
        );
        return distA - distB;
      });

      updateDOMOrder(posts); //reorder sorted posts
    });

    return; //wait for geolocation
  }
  // Apply sort to DOM for "recent"
  updateDOMOrder(posts);
});
