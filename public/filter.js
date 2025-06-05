const filterTabs = document.querySelectorAll('.post-category-container li');
const filterSelect = document.getElementById('filter-select');
const posts = Array.from(document.querySelectorAll('.post-item')); //convert NodeList to an array
let selectedType = "all"; // Track currently selected category

// Haversine formula JavaScript implementation (calculates the great-circle distance between two points on a sphere (like Earth) given their latitudes and longitudes)
function getDistance(lat1, lng1, lat2, lng2){
    const toRad = deg => (deg * Math.PI) / 180;
    const R = 6371 // Earth radius in kilometers

    //Distance between latitude and longitude
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a = 
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers

}

// Reorder posts in DOM
function updateDOMOrder(sortedPosts) {
    const container = document.getElementById('posts-list');
    container.innerHTML = ""; // Clear all posts from DOM
    sortedPosts.forEach(post => container.appendChild(post)); // Append posts in sorted order
}

// Filter by category
function applyTypeFilter() {
    posts.forEach(post => {
        const postType = post.dataset.type;
        const shouldShow = selectedType === "all" || postType === selectedType;
        post.style.display = shouldShow ? "block" : "none";
    });
}

// Category tab click handler
filterTabs.forEach(tab => {
    tab.addEventListener("click", () => {
        selectedType = tab.getAttribute('data-filter')
        applyTypeFilter();
        // for (let i = 0; i < posts.length; i++){
        //     let singlePost = posts[i];
        //     let postType = singlePost.getAttribute('data-type');
        //     // Display or not display based on the type of the data attribute
        //     if(selectedType === "all" || postType === selectedType){
        //         // "all" shows everything as a result if clicked
        //         singlePost.style.display = "block";
        //     } else {
        //         singlePost.style.display = "none";
        //     }
        // }
    })
});

// Sort handler
filterSelect.addEventListener("change", () => {
    const selectedFilter = filterSelect.value

    if(selectedFilter === "recent"){
        // Sort by newest post first
        posts.sort((a, b) => {
            return Number(b.dataset.created) - Number(a.dataset.created);
        })
        updateDOMOrder(posts);
    }

    if(selectedFilter === "nearMe"){
        // If geolocation isn’t supported, show an alert and exit
        if(!navigator.geolocation){
      showToast("Geolocation is not supported in your browser", "error");
            return;
        }
        
        //Fetch coordinates asynchronously
        navigator.geolocation.getCurrentPosition((position) => {
            console.log("User position:", position);
            // Coordinates of the user
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            // Sorts posts by distance to user
            posts.sort((a, b) => {
                const distA = getDistance(userLat, userLng, Number(a.dataset.lat), Number (a.dataset.lng));
                const distB = getDistance(userLat, userLng, Number(b.dataset.lat), Number(b.dataset.lng));
                return distA - distB;
            })

            updateDOMOrder(posts); //reorder sorted posts
        })
    
        return; //wait for geolocation
    }
    // Apply sort to DOM for "recent"
    updateDOMOrder(posts);
})


