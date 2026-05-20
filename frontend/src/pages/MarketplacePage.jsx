import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Sparkles, Tag, Plus, X, Heart, MessageCircle, AlertTriangle, Eye, ArrowRight
} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function MarketplacePage() {
  const [listings, setListings] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('others');
  const [image, setImage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [wishlistOnly, setWishlistOnly] = useState(false);

  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
  }, [activeCategory, wishlistOnly, search]);

  const fetchListings = async () => {
    try {
      const res = await api.get('/marketplace', {
        params: {
          category: activeCategory,
          search: search,
          wishlistOnly: wishlistOnly,
        },
      });
      setListings(res.data.data);
    } catch (err) {
      toast.error('Failed to load marketplace listings catalog.');
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || price === '') return;

    try {
      const res = await api.post('/marketplace', {
        title: title.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category,
        image,
      });

      setListings([res.data.data, ...listings]);
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('others');
      setImage('');
      setShowCreateModal(false);
      
      toast.success('Marketplace listing published successfully!');
    } catch (err) {
      toast.error('Failed to publish listing.');
    }
  };

  const handleWishlist = async (listingId) => {
    try {
      const res = await api.post(`/marketplace/${listingId}/wishlist`);
      setListings(listings.map(item => {
        if (item._id === listingId) {
          return { ...item, wishlist: res.data.data };
        }
        return item;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReport = async (listingId) => {
    try {
      await api.post(`/marketplace/${listingId}/report`, {
        reason: 'Suspicious Listing / Scam Alert',
      });
      toast.success('Listing reported to campus moderation staff.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to remove this product listing?')) return;

    try {
      await api.delete(`/marketplace/${listingId}`);
      setListings(listings.filter(item => item._id !== listingId));
      toast.success('Listing removed successfully.');
    } catch (err) {
      toast.error('Failed to remove listing.');
    }
  };

  // Dynamic Chat with Seller
  const handleChatSeller = async (sellerId) => {
    if (sellerId === user.id) {
      toast.error('You cannot connect DMs with yourself.');
      return;
    }

    try {
      await api.post('/chat/conversations', {
        isGroup: false,
        participants: [sellerId],
      });
      toast.success('Connecting with seller direct message thread...');
      navigate('/chat');
    } catch (err) {
      toast.error('Failed to initialize connection with seller.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 text-white">
      
      {/* Header welcome banner */}
      <div className="bg-slate-900 border border-slate-850 p-6 rounded-3xl flex justify-between items-center flex-wrap gap-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-32 w-32 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="space-y-1">
          <span className="text-[10px] font-extrabold text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2.5 py-0.5 rounded-full">Dorm Exchange</span>
          <h2 className="text-base font-extrabold">Campus Trade & Study Notes Marketplace</h2>
          <p className="text-[10px] text-slate-400 font-medium font-bold">Exchange textbooks, study notes, electronics, and hostel materials.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" /> Add Sell Listing
        </button>
      </div>

      {/* Catalog tools and filter headers */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-4 flex-wrap gap-4">
        
        {/* Category triggers */}
        <div className="flex flex-wrap gap-2">
          {['All', 'textbooks', 'electronics', 'notes', 'hostel', 'others'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === 'All' ? 'All' : cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                (activeCategory === cat) ? 'bg-orange-500 border-orange-600 text-white shadow-lg' : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search and wishlist filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-orange-500 placeholder-slate-500 flex-1 md:flex-initial"
          />

          <button
            onClick={() => setWishlistOnly(!wishlistOnly)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 shrink-0 ${
              wishlistOnly ? 'bg-amber-500 border-amber-600 text-slate-950' : 'bg-slate-900 border-slate-850 text-slate-400 hover:text-white'
            }`}
          >
            <Heart className="h-4 w-4" /> Saved Wishlist
          </button>
        </div>

      </div>

      {/* Catalog items display grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.length === 0 ? (
          <div className="col-span-full bg-slate-900 border border-slate-850 p-8 rounded-3xl text-center text-slate-500 font-bold">
            No active campus listings matching filters.
          </div>
        ) : (
          listings.map(item => {
            const isWishlisted = item.wishlist?.includes(user.id);
            const isSeller = item.seller?._id === user.id;
            return (
              <div key={item._id} className="bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-850 transition-all group relative">
                
                {/* Wishlist floating toggle */}
                <button
                  onClick={() => handleWishlist(item._id)}
                  className={`absolute top-3 right-3 p-2 bg-slate-950/80 hover:bg-slate-950 text-slate-400 rounded-full border border-slate-800 transition-transform hover:scale-115 ${
                    isWishlisted ? 'text-red-500' : ''
                  }`}
                >
                  <Heart className="h-3.5 w-3.5" fill={isWishlisted ? 'currentColor' : 'none'} />
                </button>

                <div>
                  {/* Photo attachment display */}
                  <div className="h-40 bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-850 relative">
                    {item.image ? (
                      <img src={item.image} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt="product" />
                    ) : (
                      <ShoppingBag className="h-10 w-10 text-slate-700 animate-pulse" />
                    )}
                    <span className="absolute bottom-2 left-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase">
                      {item.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="text-xs font-extrabold text-white truncate max-w-[130px]">{item.title}</h3>
                      <span className="text-xs font-extrabold text-orange-400">
                        {item.price === 0 ? 'FREE' : `₹${item.price}`}
                      </span>
                    </div>

                    <p className="text-[10px] text-slate-400 font-medium leading-normal line-clamp-2 h-8">{item.description}</p>
                    
                    <div className="flex items-center gap-1.5 border-t border-slate-850 pt-2 text-[9px] text-slate-500 font-bold">
                      <span className="truncate">Seller: {item.seller?.name || 'Peer student'}</span>
                    </div>
                  </div>
                </div>

                {/* Sell CTA buttons */}
                <div className="p-4 border-t border-slate-850 bg-slate-950/40 grid grid-cols-12 gap-2 shrink-0">
                  {isSeller ? (
                    <button
                      onClick={() => handleDeleteListing(item._id)}
                      className="col-span-12 py-1.5 bg-red-600/20 hover:bg-red-600 border border-red-500/30 hover:border-red-600 text-red-400 hover:text-white text-[10px] font-bold rounded-xl transition-all"
                    >
                      Delete Sell Card
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleChatSeller(item.seller?._id)}
                        className="col-span-9 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-[10px] font-extrabold rounded-xl transition-all flex items-center justify-center gap-1"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Direct Chat Seller
                      </button>
                      <button
                        onClick={() => handleReport(item._id)}
                        className="col-span-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-red-500/10 text-slate-500 hover:text-red-500 text-[10px] rounded-xl flex items-center justify-center transition-colors"
                        title="Flag listing"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Add Sell Listing */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 max-w-sm w-full space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Add Sell Listing</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-slate-800 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateListing} className="space-y-4 text-slate-350 text-xs">
              <div className="space-y-1">
                <label className="font-extrabold text-[10px] text-slate-500 uppercase">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SPPU 2nd Year Syllabus Book"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-[10px] text-slate-500 uppercase">Price (INR) - Set 0 for free exchange</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-[10px] text-slate-500 uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    {['textbooks', 'electronics', 'notes', 'hostel', 'others'].map(cat => (
                      <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-[10px] text-slate-500 uppercase">Image URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://image-link.com"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-extrabold text-[10px] text-slate-500 uppercase">Listing Details</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Condition of book/item, exchange details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none resize-none"
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-white font-extrabold transition-all shadow-lg">
                Publish Listing
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
