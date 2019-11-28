const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    
    name: {
        type: String,
        required: true
    },

    age: {
        type: Number
    },

    email: {
        type: String,
        required: true 
    },

    password: {
        type: String,
        required: true 
    },

    status: {
        type: String,
        required: true 
    },
    posts: [{
        type: Schema.Types.ObjectId,
        ref: 'Post' 
    }]
},
{timestamps: true}
)

module.exports = mongoose.model('User', userSchema);