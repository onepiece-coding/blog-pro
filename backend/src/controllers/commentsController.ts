import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import createError from 'http-errors';
import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Post from '../models/Post.js';
import z from 'zod';

// query schema for get all posts
const getCommentsQuerySchema = z.object({
  pageNumber: z.preprocess((val) => {
    const s = Array.isArray(val) ? val[0] : (val ?? '1');
    const n = Number(s);
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
  }, z.number().int().min(1).default(1)),
});

/**------------------------------------------------
 * @desc   Create New Comment
 * @route  /api/v1/comments
 * @method POST
 * @access private (only the logged in user)
---------------------------------------------------*/
export const createCommentCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    // Need to check if the post exists (Not in Coure)
    const post = await Post.findById(req.body.postId);
    if (!post) {
      throw createError(404, 'Post not found!');
    }

    const profile = await User.findById(req.user.id);

    const newComment = new Comment({
      postId: req.body.postId,
      text: req.body.text,
      user: req.user.id,
      username: profile!.username,
    });

    const savedComment = await newComment.save();

    const comment = await savedComment.populate('user');

    res.status(201).json(comment);
  },
);

/**------------------------------------------------
 * @desc   Get All Comments
 * @route  /api/v1/comments
 * @method GET
 * @access private (only admin)
---------------------------------------------------*/
export const getAllCommentsCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = getCommentsQuerySchema.safeParse(req.query);
    if (!parsed.success) throw createError(400, 'Invalid query parameters');

    const { pageNumber } = parsed.data;
    const COMMENT_PER_PAGE = 5;
    const skip = (pageNumber - 1) * COMMENT_PER_PAGE;

    const total = await Comment.countDocuments();

    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(COMMENT_PER_PAGE)
      .populate('user');

    res.status(200).json({
      comments,
      totalPages: Math.ceil(total / COMMENT_PER_PAGE),
    });
  },
);

/**------------------------------------------------
 * @desc   Delete Comment
 * @route  /api/v1/comments
 * @method DELETE
 * @access private (only admin or owner of the comment)
---------------------------------------------------*/
export const deleteCommentCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      throw createError(404, 'Comment not found!');
    }

    if (req.user.isAdmin || req.user.id === comment.user.toString()) {
      await Comment.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'comment has been deleted' });
    } else {
      throw createError(403, 'Access denied, not aloowed!');
    }
  },
);

/**------------------------------------------------
 * @desc   Update Comment
 * @route  /api/v1/comments/:id
 * @method PUT
 * @access private (only owner of the comment)
---------------------------------------------------*/
export const updateCommentCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      throw createError(404, 'Comment not found!');
    }

    if (req.user.id !== comment.user.toString()) {
      throw createError(
        404,
        'Access denied, only user himself can edit his comment!',
      );
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          text: req.body.text,
        },
      },
      { new: true },
    ).populate('user');

    res.status(201).json(updatedComment);
  },
);

/**------------------------------------------------
 * @route  /api/v1/comments/post/:postId
 * @desc   Get Post Comments
 * @access public
 * @method GET
---------------------------------------------------*/
export const getPostCommentsCtrl = asyncHandler(
  async (req: Request, res: Response) => {
    const postComments = await Comment.find({
      postId: req.params.postId,
    })
      .populate('user')
      .sort({ createdAt: -1 });

    res.status(200).json(postComments);
  },
);
