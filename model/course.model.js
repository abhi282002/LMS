import { model, Schema } from "mongoose";

const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      minLength: [8, "Title must be atleast 8 character"],
      maxLength: [60, "Title must be less than 60 character"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      minLength: [8, "Description must be atleast 8 character"],
      maxLength: [200, "Description must be less than 200 character"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    thumbnail: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    lectures: [
      {
        _id: { type: Schema.Types.ObjectId, auto: true },
        title: String,
        description: String,
        lecture: {
          public_id: {
            type: String,
          },
          secure_url: {
            type: String,
          },
        },
      },
    ],
    numbersOfLectures: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Course = model("Course", courseSchema);
