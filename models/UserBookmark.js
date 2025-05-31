const mongoose = require('mongoose');



// user.id
// post found by the id
// 

// Post schemas sames as Bookmark
// Fix the routes and the scemas
// Fix the route and hashes
const bookmarkSchema = new mongoose.Schema({

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    post:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        require: true
    },

    // Adding a timestamp for when the bookmark was created (Optional)

    createAt: {
        type: Date,
        deafult: Date.now
    }
})



// Create a compound unique index fields

bookmarkSchema.index({user: 1, post: 1}, {unique: true});


module.exports = mongoose.model("Bookmark", pinSchema);