// front end logic for update without reload/AJAX


// document.querySelectorAll('.vote-icon').forEach(icon => {
//   icon.addEventListener('click', async (e) => {
//     const postId = e.currentTarget.dataset.id;
//     const isUpvote = e.currentTarget.classList.contains('upvote');
//     const route = isUpvote ? `/feed/${postId}/upvote` : `/feed/${postId}/downvote`;

//     try {
//       const res = await fetch(route, { method: 'PUT' });
//       const data = await res.json();
//       const voteSpan = document.getElementById(`vote-${postId}`);
//       if (voteSpan) {
//         voteSpan.textContent = data.voteCount;
//       }
//     } catch (err) {
//       console.error('Vote failed', err);
//     }
//   });
// });