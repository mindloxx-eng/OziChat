import React, { useMemo, useState } from 'react';
import type { VideoPost } from '../../types';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import { VideoIcon, HeartIcon, EyeIcon, ChatIcon, TrashIcon, FlagIcon } from '../icons';

interface ReelsProps {
  posts: VideoPost[];
  onUpdate: (posts: VideoPost[]) => void;
  search: string;
}

const parseCount = (s?: string | number): number => {
  if (typeof s === 'number') return s;
  if (!s) return 0;
  const cleaned = s.replace(/,/g, '').trim().toUpperCase();
  const m = cleaned.match(/^([\d.]+)\s*([KM]?)$/);
  if (!m) return parseInt(cleaned, 10) || 0;
  const n = parseFloat(m[1]);
  if (m[2] === 'K') return Math.round(n * 1_000);
  if (m[2] === 'M') return Math.round(n * 1_000_000);
  return Math.round(n);
};

const fmtCount = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n.toString();

const Reels: React.FC<ReelsProps> = ({ posts, onUpdate, search }) => {
  const [category, setCategory] = useState<'all' | string>('all');

  const categories = useMemo(() => Array.from(new Set(posts.map(p => p.category).filter(Boolean))), [posts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter(p => {
      if (category !== 'all' && p.category !== category) return false;
      if (!q) return true;
      return (
        p.description.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.authorHandle.toLowerCase().includes(q) ||
        (p.tags || []).some(t => t.toLowerCase().includes(q))
      );
    });
  }, [posts, category, search]);

  const stats = useMemo(() => {
    const totalLikes = posts.reduce((s, p) => s + (p.likeCount ?? parseCount(p.likes)), 0);
    const totalViews = posts.reduce((s, p) => s + (p.viewCount ?? 0), 0);
    const totalComments = posts.reduce((s, p) => s + (p.commentCount ?? parseCount(p.comments)), 0);
    return { totalLikes, totalViews, totalComments };
  }, [posts]);

  const removePost = (id: string) => {
    if (!confirm('Delete this reel permanently?')) return;
    onUpdate(posts.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Published reels" value={posts.length.toString()} icon={<VideoIcon className="w-5 h-5" />} accent="blue" />
        <StatCard label="Total views" value={fmtCount(stats.totalViews)} icon={<EyeIcon className="w-5 h-5" />} accent="violet" />
        <StatCard label="Total likes" value={fmtCount(stats.totalLikes)} icon={<HeartIcon className="w-5 h-5" />} accent="green" />
        <StatCard label="Total comments" value={fmtCount(stats.totalComments)} icon={<ChatIcon className="w-5 h-5" />} accent="orange" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
            category === 'all'
              ? 'border-[#3F9BFF]/50 bg-[#3F9BFF]/15 text-[#7cb8ff]'
              : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white hover:border-white/20'
          }`}
        >
          All <span className="ml-2 text-[10px] text-white/40">{posts.length}</span>
        </button>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              category === c
                ? 'border-[#3F9BFF]/50 bg-[#3F9BFF]/15 text-[#7cb8ff]'
                : 'border-white/10 bg-white/[0.03] text-white/60 hover:text-white hover:border-white/20'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filtered.map(p => {
          const likes = p.likeCount ?? parseCount(p.likes);
          const comments = p.commentCount ?? parseCount(p.comments);
          const views = p.viewCount ?? 0;
          return (
            <div key={p.id} className="group rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden flex flex-col">
              <div className="relative aspect-[9/14] bg-black overflow-hidden">
                {p.thumbnailUrl ? (
                  <img src={p.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <video
                    src={p.videoUrl}
                    muted
                    playsInline
                    preload="metadata"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge tone="blue">{p.category}</Badge>
                  {p.targeting?.scope && p.targeting.scope !== 'global' && (
                    <Badge tone="violet">{p.targeting.scope}{p.targeting.value ? ` · ${p.targeting.value}` : ''}</Badge>
                  )}
                </div>
                <button
                  onClick={() => removePost(p.id)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-lg border border-white/10 bg-black/40 hover:bg-red-500/80 hover:border-red-500 flex items-center justify-center transition-colors"
                  title="Delete reel"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    {p.authorAvatar ? (
                      <img src={p.authorAvatar} alt="" className="w-7 h-7 rounded-full border border-white/30" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#3F9BFF] to-[#8a5bff] border border-white/30 flex items-center justify-center text-[11px] font-bold">
                        {p.author.slice(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{p.author}</div>
                      <div className="text-[10px] text-white/60 truncate">{p.authorHandle}</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-white/80 line-clamp-2">{p.description}</p>
                </div>
              </div>

              <div className="p-3 flex items-center justify-between text-[11px] text-white/60">
                <span className="flex items-center gap-1"><HeartIcon className="w-3.5 h-3.5" />{fmtCount(likes)}</span>
                <span className="flex items-center gap-1"><ChatIcon className="w-3.5 h-3.5" />{fmtCount(comments)}</span>
                <span className="flex items-center gap-1"><EyeIcon className="w-3.5 h-3.5" />{fmtCount(views)}</span>
                <span className="text-white/30">{new Date(p.postedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</span>
              </div>
            </div>
          );
        })}
        {!filtered.length && (
          <Card className="col-span-full">
            <div className="py-12 text-center text-white/40 text-sm flex flex-col items-center gap-2">
              <FlagIcon className="w-6 h-6 text-white/30" />
              No reels match your filters
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reels;
