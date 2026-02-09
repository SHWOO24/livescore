import mongoose, { Document, Schema } from 'mongoose';

export interface IChatRoom extends Document {
  name: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chatRoomSchema = new Schema<IChatRoom>(
  {
    name: {
      type: String,
      required: [true, '채팅룸 이름을 입력해주세요'],
      trim: true,
      maxlength: [50, '채팅룸 이름은 50자 이하여야 합니다'],
    },
    description: {
      type: String,
      maxlength: [200, '설명은 200자 이하여야 합니다'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false, // 시스템 생성 채팅룸 허용
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// 인덱스 생성
chatRoomSchema.index({ createdAt: -1 });
chatRoomSchema.index({ members: 1 });

export default mongoose.model<IChatRoom>('ChatRoom', chatRoomSchema);
