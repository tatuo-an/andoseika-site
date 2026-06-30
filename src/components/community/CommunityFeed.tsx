"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Heart, Bookmark, Pencil, Trash2, Check, X, Camera, ChevronDown } from "lucide-react";

type Post = {
  id: string;
  email: string;
  displayName: string;
  productName: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
  likeCount: number;
  liked: boolean;
  saved: boolean;
  isOwner: boolean;
  productFamily: string;
  productId: string;
};

type PurchasedProduct = { family: string; id: string };

function PostCard({ post, myEmail, onLike, onSave, onEdit, onDelete }: {
  post: Post;
  myEmail: string;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onEdit: (id: string, caption: string) => void;
  onDelete: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.caption);
  const [saving, setSaving] = useState(false);

  async function saveEdit() {
    setSaving(true);
    await fetch(`/api/community/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ caption: editText }),
    });
    onEdit(post.id, editText);
    setEditing(false);
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("この投稿を削除しますか？")) return;
    await fetch(`/api/community/${post.id}`, { method: "DELETE" });
    onDelete(post.id);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      <Link href={`/community/${post.id}`} className="block aspect-square w-full bg-stone-100">
        <img src={post.imageUrl} alt="料理写真" className="w-full h-full object-cover hover:opacity-90 transition-opacity" />
      </Link>

      <div className="p-4">
        <div className="mb-2">
          <span className="inline-block text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            🥬 {post.productName}
          </span>
        </div>

        {editing ? (
          <div className="mb-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
            <div className="flex gap-2 mt-1.5">
              <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg disabled:opacity-50">
                <Check className="w-3 h-3" />{saving ? "保存中..." : "保存"}
              </button>
              <button onClick={() => { setEditing(false); setEditText(post.caption); }} className="flex items-center gap-1 px-3 py-1.5 border border-stone-200 text-stone-500 text-xs rounded-lg">
                <X className="w-3 h-3" />キャンセル
              </button>
            </div>
          </div>
        ) : (
          post.caption && <p className="text-sm text-stone-700 mb-3 whitespace-pre-wrap">{post.caption}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => onLike(post.id)}
              disabled={!myEmail}
              className={`flex items-center gap-1.5 text-sm transition-colors ${post.liked ? "text-red-500" : "text-stone-400 hover:text-red-400"} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Heart className={`w-5 h-5 ${post.liked ? "fill-red-500" : ""}`} />
              <span className="text-xs font-medium">{post.likeCount}</span>
            </button>
            <button
              onClick={() => onSave(post.id)}
              disabled={!myEmail}
              title={post.saved ? "保存済み" : "記録する"}
              className={`transition-colors ${post.saved ? "text-primary" : "text-stone-400 hover:text-primary"} disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <Bookmark className={`w-5 h-5 ${post.saved ? "fill-primary" : ""}`} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs font-medium text-stone-700">{post.displayName || "匿名"}</p>
              <p className="text-[10px] text-stone-400">{post.createdAt.slice(0, 10)}</p>
            </div>
            {post.isOwner && !editing && (
              <div className="flex gap-1">
                <button onClick={() => setEditing(true)} className="p-1.5 text-stone-400 hover:text-stone-600 transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleDelete} className="p-1.5 text-stone-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PostForm({ myEmail, myName, onPosted }: { myEmail: string; myName: string; onPosted: (post: Post, pointsEarned: number) => void }) {
  const [products, setProducts] = useState<PurchasedProduct[]>([]);
  const [canPost, setCanPost] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<PurchasedProduct[]>([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState(myName);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!myEmail) return;
    fetch("/api/my/purchased-products")
      .then((r) => r.json())
      .then((d) => { setProducts(d.products ?? []); setCanPost((d.products ?? []).length > 0); })
      .catch(() => setCanPost(false));
    fetch("/api/my/profile")
      .then((r) => r.json())
      .then((d) => { if (d.displayName) setDisplayName(d.displayName); });
  }, [myEmail]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setImagePreview(URL.createObjectURL(f));
  }

  function toggleProduct(p: PurchasedProduct) {
    setSelectedProducts((prev) =>
      prev.some((x) => x.family === p.family)
        ? prev.filter((x) => x.family !== p.family)
        : [...prev, p]
    );
  }

  async function submit() {
    if (!imageFile || selectedProducts.length === 0) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", imageFile);
      const uploadRes = await fetch("/api/my/upload-image", { method: "POST", body: form });
      const { url } = await uploadRes.json();
      if (!url) throw new Error("upload failed");

      const familyStr = selectedProducts.map((p) => p.family).join(",");
      const idStr = selectedProducts.map((p) => p.id).join(",");

      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName: familyStr, productFamily: familyStr, productId: idStr, imageUrl: url, caption, displayName }),
      });
      const data = await res.json();
      if (data.ok) {
        const now = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
        onPosted({ id: data.postId, email: myEmail, displayName, productName: familyStr, imageUrl: url, caption, createdAt: now, likeCount: 0, liked: false, saved: false, isOwner: true, productFamily: familyStr, productId: idStr }, data.pointsEarned ?? 0);
        setOpen(false);
        setImageFile(null);
        setImagePreview("");
        setSelectedProducts([]);
        setCaption("");
      }
    } finally {
      setUploading(false);
    }
  }

  if (!myEmail) return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5 text-center text-sm text-stone-400 mb-6">
      <a href="/login" className="text-primary font-medium">ログイン</a>すると料理を投稿できます
    </div>
  );

  if (canPost === false) return (
    <div className="bg-white rounded-2xl border border-stone-100 p-5 text-center text-sm text-stone-400 mb-6">
      商品を購入すると料理を投稿できます
    </div>
  );

  if (canPost === null) return null;

  return (
    <div className="bg-white rounded-2xl border border-stone-100 mb-6 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-stone-50 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Camera className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm text-stone-500 flex-1">料理写真を投稿する...</span>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-stone-100 p-5 space-y-4">
          <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 text-xs text-stone-600 leading-relaxed">
            <p>初めての料理投稿で100pt、次回以降は月1回まで50ptをプレゼントします。</p>
            <p className="text-stone-500 mt-1">※料理投稿ポイントの付与は、1アカウントにつき月1回までです。重複投稿や、料理と関係のない投稿などはポイント付与の対象外です。</p>
          </div>
          <div
            onClick={() => fileRef.current?.click()}
            className="aspect-video w-full bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-primary/40 transition-colors overflow-hidden"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="プレビュー" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <Camera className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-sm text-stone-400">タップして写真を選ぶ</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

          <div>
            <label className="block text-xs text-stone-500 mb-1.5">使った商品（複数選択可）</label>
            <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
              {products.map((p) => {
                const checked = selectedProducts.some((x) => x.family === p.family);
                return (
                  <label key={p.family} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${checked ? "bg-primary/5" : "hover:bg-stone-50"}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleProduct(p)}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm text-stone-700">{p.family}</span>
                  </label>
                );
              })}
            </div>
            {selectedProducts.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {selectedProducts.map((p) => (
                  <span key={p.family} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
                    🥬 {p.family}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-stone-500 mb-1.5">ひとこと（任意）</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              placeholder="どんな料理を作りましたか？"
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <button
            onClick={submit}
            disabled={!imageFile || selectedProducts.length === 0 || uploading}
            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {uploading ? "投稿中..." : "投稿する"}
          </button>
        </div>
      )}
    </div>
  );
}

export function CommunityFeed({ myEmail, myName }: { myEmail: string; myName: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/community")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  async function handleLike(id: string) {
    if (!myEmail) return;
    const res = await fetch(`/api/community/${id}/like`, { method: "POST" });
    const data = await res.json();
    if (data.ok) setPosts((prev) => prev.map((p) => p.id === id ? { ...p, liked: data.liked, likeCount: data.likeCount } : p));
  }

  async function handleSave(id: string) {
    if (!myEmail) return;
    const res = await fetch(`/api/community/${id}/bookmark`, { method: "POST" });
    const data = await res.json();
    if (data.ok) setPosts((prev) => prev.map((p) => p.id === id ? { ...p, saved: data.saved } : p));
  }

  return (
    <div className="relative">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-primary text-white text-sm font-bold px-5 py-2.5 rounded-full shadow-lg">
          {toast}
        </div>
      )}
      <PostForm myEmail={myEmail} myName={myName} onPosted={(post, pointsEarned) => {
        setPosts((prev) => [post, ...prev]);
        if (pointsEarned > 0) showToast(`⭐ 投稿ボーナス +${pointsEarned}pt 獲得！`);
      }} />

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
              <div className="aspect-square w-full bg-stone-100 animate-pulse" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-20 bg-stone-100 rounded animate-pulse" />
                <div className="h-3 w-40 bg-stone-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-16 text-stone-400">
          <p className="text-lg mb-2">まだ投稿がありません</p>
          <p className="text-sm">購入した野菜で作った料理を投稿してみましょう！</p>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            myEmail={myEmail}
            onLike={handleLike}
            onSave={handleSave}
            onEdit={(id, caption) => setPosts((prev) => prev.map((p) => p.id === id ? { ...p, caption } : p))}
            onDelete={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
          />
        ))}
      </div>
    </div>
  );
}
