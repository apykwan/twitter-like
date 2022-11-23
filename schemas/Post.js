const { Schema, model } = require('mongoose');

const PostSchema = new Schema({
  content: { 
    type: String,
    trime: true
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    pinned: Boolean
  }
}, {
  timestamps: true
});

module.exports = model("Post", PostSchema);