import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage extends Document {
  room: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  userName: string;
  message: string;
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    room: {
      type: Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: [500, '메시지는 500자 이하여야 합니다'],
    },
  },
  {
    timestamps: true,
  }
);

// 인덱스 생성
chatMessageSchema.index({ room: 1, createdAt: -1 });
chatMessageSchema.index({ createdAt: -1 });

export default mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
