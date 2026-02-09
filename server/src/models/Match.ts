import mongoose, { Document, Schema } from 'mongoose';

export interface IMatch extends Document {
  sport: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'live' | 'finished';
  matchDate: Date;
  venue?: string;
  round?: string;
  createdAt: Date;
  updatedAt: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    sport: {
      type: String,
      required: true,
      enum: ['축구', '야구', '농구', '배구', '하키', '기타'],
    },
    league: {
      type: String,
      required: true,
    },
    homeTeam: {
      type: String,
      required: true,
    },
    awayTeam: {
      type: String,
      required: true,
    },
    homeScore: {
      type: Number,
      default: 0,
    },
    awayScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['scheduled', 'live', 'finished'],
      default: 'scheduled',
    },
    matchDate: {
      type: Date,
      required: true,
    },
    venue: {
      type: String,
    },
    round: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// 인덱스 생성
matchSchema.index({ matchDate: 1, status: 1 });
matchSchema.index({ sport: 1, league: 1 });

export default mongoose.model<IMatch>('Match', matchSchema);
