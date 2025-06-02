document.addEventListener('DOMContentLoaded', () => {
  const upvote = document.querySelector('.upvote-button');
  const downvote = document.querySelector('.downvote-button');

  upvote.addEventListener('click', () => {
    upvote.classList.toggle('active-upvote');
    downvote.classList.remove('active-downvote');
  });

  downvote.addEventListener('click', () => {
    downvote.classList.toggle('active-downvote');
    upvote.classList.remove('active-upvote');
  });
});

