import asyncHandler from "../middleware/asyncHandler.js";
import Category from "../models/categoryModel.js";
import Post from "../models/postModel.js";
import Like from "../models/LikeModel.js";


// @desc    Fetch all posts
// @route   GET /api/posts
// @access  Public
const getPosts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  try {
    const totalPosts = await Post.countDocuments();

    const posts = await Post.find()
      .populate("category", "name")
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    if (!posts.length) {
      return res.json({
        res: true,
        message: "Cannot find the data",
        find: false,
      });
    }

    res.json({
      posts,
      currentPage: pageNum,
      totalPages: Math.ceil(totalPosts / limitNum),
      totalPosts,
      find: true,
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// @desc    Fetch posts by search query
// @route   GET /api/posts/search/:q
// @access  Public

const getSearchedPosts = asyncHandler(async (req, res) => {
  const { q } = req.query;  

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ message: "Query parameter 'q' must be a valid string" });
  }


  const posts = await Post.find({
    $or: [
      { title: { $regex: q, $options: "i" } },
      { content: { $regex: q, $options: "i" } },
    ],
  });

  if (posts.length === 0) {
    return res.status(404).json({ message: "No posts found for the query" });
  }
  

  res.json(posts);
});




// @desc    Fetch a post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostsById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid post ID format" });
  }

  try {
    const post = await Post.findById(id).populate("category", "name").populate("userId", "username");

    if (post) {
      post.views = (post.views || 0) + 1;

      await post.save();

      return res.json(post);
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Fetch posts by category
// @route   GET /api/posts/category/:category
// @access  Public

const getPostByCategory = asyncHandler(async (req, res) => {
  const categoryName = req.params.category;
  

  const category = await Category.findOne({ name: categoryName });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: "Category not found",
    });
  }

  const posts = await Post.find({ category: category._id })
    .populate("category", "name")
    .populate("userId", "username")


  const totalPosts = await Post.countDocuments({ category: category._id });

  if (posts.length > 0) {
    res.json({
      posts,
      totalPosts,
    });
  } else {
    res.status(404).json({
      success: false,
      message: "No posts found for the category",
    });
  }
});


// @desc    Create a new post
// @route   POST /api/posts
// @access  Private/Admin
const createPost = asyncHandler(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Not authorized to create posts",
    });
  }

  const { title, content, category, tags, introDescription } = req.body;


  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: "Title and content are required.",
    });
  }


  let categoryObj = null;
  if (category) {
    categoryObj = await Category.findOne({ name: category });
    if (!categoryObj) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }
  }


  let tagsArray = [];
  if (tags) {
    tagsArray = tags.split(',').map(tag => tag.trim());
  }


  let thumbnailPath = null;
  if (req.file) {
    
    thumbnailPath = `/uploads/images/${req.file.filename}`;
  }


  const post = new Post({
    title,
    content,
    category: categoryObj ? categoryObj._id : null,
    tags: tagsArray,
    introDescription: introDescription || "",
    image: thumbnailPath,  
    userId: [req.user._id],
  });


  const createdPost = await post.save();


  if (categoryObj) {
    categoryObj.posts.push(createdPost._id);
    await categoryObj.save();
  }

  res.status(201).json({
    success: true,
    post: createdPost,
  });
});

export default createPost;

// @desc    Delete a post by ID
// @route   DELETE /api/posts/:id
// @access  Private/Admin
const deletePost = asyncHandler(async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    await Post.findByIdAndDelete(req.params.id);

    await Category.updateOne(
      { _id : post.category },
      { $pull: { posts: post._id } }
    );

    await Like.deleteMany({ postId: post._id });

    

    res.status(200).json({
      success: true,
      message: "Post removed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the post",
      error: error.message,
    });
  }
});

//  Update a post
// @route   PUT /api/posts/:id
// @access  Private
const updatePost = asyncHandler(async (req, res) => {
  const { id } = req.params; 
  const { title, content, selectCategory } = req.body; 

  
  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const category = await Category.findOne({ name: selectCategory });

  if (!category) {
    res.status(400);
    throw new Error("Category not found");
  }

 
  post.title = title || post.title; 
  post.content = content || post.content; 
  post.category = category._id;


  const updatedPost = await post.save();

  
  res.json(updatedPost);
});


const likePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  const existingLike = await Like.findOne({
    userId: req.user._id,
    postId: post._id,
  });

  if (existingLike) {
    res.status(400);
    throw new Error("Post already liked");
  }

  

  post.likes = post.likes + 1;

  
   

  const like = new Like({
    userId: req.user._id,
    postId: post._id,
    like: true,
  });

  await like.save();


  const updatedPost = await post.save();

  res.status(200).json({ likes: updatedPost.likes });
}
);


const dislikePost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {
    res.status(404);
    throw new Error("Post not found");
  }

  post.likes = post.likes - 1;

  const like = await Like.findOneAndDelete({
    userId: req.user._id,
    postId: post._id,
    like: true,
  });

  if (!like) {
    res.status(400);
    throw new Error("Like not found");
  }

  const updatedPost = await post.save();

  res.status(200).json({ likes: updatedPost.likes });
}
);


const likedPost = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const post = await Post.findById(id);

  if (!post) {  
    res.status(404);
    throw new Error("Post not found");
  }

  const isLiked = await Like.findOne({
    userId: req.user._id,
    postId: post._id,
    like: true,
  });

  res.status(200).json({ isLiked: !!isLiked });
}

);











export { getPosts, getPostsById, getPostByCategory,updatePost, createPost, deletePost ,likePost, dislikePost, likedPost, getSearchedPosts};
