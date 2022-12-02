const { Schema, model } = require('mongoose');

const PostSchema = new Schema({
  content: { 
    type: String,
    trime: true
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  pinned: Boolean,
  retweetUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  retweetData: { type: Schema.Types.ObjectId, ref: 'Post' },
  replyTo: { type: Schema.Types.ObjectId, ref: 'Post' },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = model("Post", PostSchema);