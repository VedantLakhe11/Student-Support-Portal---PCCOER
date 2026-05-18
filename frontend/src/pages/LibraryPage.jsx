import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Search, Book, PlusCircle, CheckCircle, AlertCircle, Bookmark, Trash } from 'lucide-react';

const INITIAL_BOOKS = [
  { id: 1, title: 'Data Structures & Algorithms', author: 'Thomas H. Cormen', category: 'Computer Engineering', available: 3, total: 5, emoji: '📘', color: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400' },
  { id: 2, title: 'Clean Code', author: 'Robert C. Martin', category: 'Software Engineering', available: 0, total: 3, emoji: '📗', color: 'from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400' },
  { id: 3, title: 'Operating Systems Concepts', author: 'Silberschatz & Galvin', category: 'Information Technology', available: 2, total: 4, emoji: '📙', color: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400' },
  { id: 4, title: 'Database Management Systems', author: 'Ramakrishnan & Gehrke', category: 'Computer Engineering', available: 5, total: 5, emoji: '📕', color: 'from-rose-500/10 to-red-500/10 text-rose-600 dark:text-rose-400' },
  { id: 5, title: 'Computer Networks', author: 'Andrew Tanenbaum', category: 'ENTC', available: 1, total: 3, emoji: '📓', color: 'from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400' },
  { id: 6, title: 'Artificial Intelligence: A Modern Approach', author: 'Russell & Norvig', category: 'Artificial Intelligence', available: 2, total: 2, emoji: '📔', color: 'from-sky-500/10 to-cyan-500/10 text-sky-600 dark:text-sky-400' },
];

const LibraryPage = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Modals / Alerts
  const [alert, setAlert] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New book state
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    category: 'Computer Engineering',
    total: 5,
    emoji: '📘',
  });

  const showAlert = (message, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleReserve = (bookId) => {
    setBooks(prevBooks =>
      prevBooks.map(book => {
        if (book.id === bookId && book.available > 0) {
          showAlert(`Successfully reserved "${book.title}"! Collect it from the PCCOER Central Library.`, 'success');
          return { ...book, available: book.available - 1 };
        }
        return book;
      })
    );
  };

  const handleWaitlist = (bookId) => {
    showAlert(`Added to waitlist for "${books.find(b => b.id === bookId)?.title}". You will be notified once a copy is returned!`, 'info');
  };

  const handleDelete = (bookId) => {
    setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
    showAlert('Book removed from library catalogue.', 'warning');
  };

  const handleAddBook = (e) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) {
      showAlert('Please enter both Title and Author', 'error');
      return;
    }

    const emojis = ['📘', '📗', '📙', '📕', '📓', '📔'];
    const colors = [
      'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400',
      'from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400',
      'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400',
      'from-rose-500/10 to-red-500/10 text-rose-600 dark:text-rose-400',
      'from-violet-500/10 to-purple-500/10 text-violet-600 dark:text-violet-400',
    ];

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

    const createdBook = {
      id: Date.now(),
      title: newBook.title,
      author: newBook.author,
      category: newBook.category,
      available: parseInt(newBook.total),
      total: parseInt(newBook.total),
      emoji: randomEmoji,
      color: randomColor,
    };

    setBooks([createdBook, ...books]);
    setShowAddForm(false);
    setNewBook({ title: '', author: '', category: 'Computer Engineering', total: 5, emoji: '📘' });
    showAlert(`Successfully added "${createdBook.title}" to database!`, 'success');
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || book.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...new Set(books.map(b => b.category))];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6">
      {/* Floating Alert System */}
      {alert && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl animate-fade-in ${
          alert.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300' :
          alert.type === 'error' ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300' :
          alert.type === 'warning' ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300' :
          'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/40 text-indigo-800 dark:text-indigo-300'
        }`}>
          {alert.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="text-sm font-semibold">{alert.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 to-indigo-900 dark:from-slate-900 dark:to-indigo-950/40 p-6 md:p-8 rounded-3xl text-white shadow-xl shadow-brand-500/5 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
        <div className="space-y-1.5 relative z-10">
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2">
            📚 PCCOER Library Hub
          </h1>
          <p className="text-indigo-200 text-sm max-w-xl font-medium leading-relaxed">
            Reserve books, track your borrow queue, and explore the academic resources at Pimpri Chinchwad College of Engineering & Research.
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-950 font-bold rounded-xl shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all self-start md:self-center"
          >
            <PlusCircle className="h-4 w-4 stroke-[2.5]" />
            Add New Book
          </button>
        )}
      </div>

      {/* Admin Add Book Drawer/Form */}
      {showAddForm && (
        <form onSubmit={handleAddBook} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 md:p-6 shadow-md animate-slide-up space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-brand-600" />
              Catalogue Registration
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Book Title</label>
              <input
                type="text"
                value={newBook.title}
                onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                placeholder="e.g. Design Patterns"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Author</label>
              <input
                type="text"
                value={newBook.author}
                onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                placeholder="e.g. Erich Gamma"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Department Category</label>
              <select
                value={newBook.category}
                onChange={e => setNewBook({ ...newBook, category: e.target.value })}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors"
              >
                <option>Computer Engineering</option>
                <option>Software Engineering</option>
                <option>Information Technology</option>
                <option>ENTC</option>
                <option>Artificial Intelligence</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Stock copies</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newBook.total}
                onChange={e => setNewBook({ ...newBook, total: e.target.value })}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-bold rounded-xl shadow-md text-sm hover:opacity-95 active:scale-95 transition-all"
            >
              Register Book
            </button>
          </div>
        </form>
      )}

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search book catalog by title, author, category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/60 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 shadow-sm transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap border transition-all ${
                categoryFilter === cat
                  ? 'bg-slate-900 border-slate-900 text-white dark:bg-white dark:border-white dark:text-slate-950 shadow-sm'
                  : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Catalogue Catalogue Grid */}
      {filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-4 relative overflow-hidden"
            >
              {/* Cover Design */}
              <div className={`h-16 w-12 rounded-xl flex-shrink-0 flex items-center justify-center text-2xl font-bold bg-gradient-to-br shadow-inner shadow-black/5 ${book.color}`}>
                {book.emoji}
              </div>

              {/* Info Column */}
              <div className="flex-grow min-w-0 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {book.category}
                </span>
                <h3 className="font-bold text-slate-900 dark:text-white truncate mt-1">
                  {book.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  by <span className="font-medium text-slate-600 dark:text-slate-300">{book.author}</span>
                </p>

                {/* Copies Left */}
                <div className="pt-2 flex items-center gap-1.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${book.available > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  <span className={`text-[11px] font-bold ${
                    book.available > 2 ? 'text-emerald-600 dark:text-emerald-400' :
                    book.available > 0 ? 'text-amber-600 dark:text-amber-400' :
                    'text-rose-600 dark:text-rose-400'
                  }`}>
                    {book.available > 0
                      ? `${book.available} of ${book.total} copies available`
                      : 'Currently out of stock'}
                  </span>
                </div>
              </div>

              {/* Action Side Panel */}
              <div className="flex flex-col gap-1.5 self-center">
                {book.available > 0 ? (
                  <button
                    onClick={() => handleReserve(book.id)}
                    className="px-3.5 py-1.5 bg-brand-600 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/10 hover:bg-indigo-600 hover:-translate-y-0.5 transition-all whitespace-nowrap"
                  >
                    Reserve Book
                  </button>
                ) : (
                  <button
                    onClick={() => handleWaitlist(book.id)}
                    className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all whitespace-nowrap"
                  >
                    Join Waitlist
                  </button>
                )}
                {user?.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(book.id)}
                    className="flex items-center justify-center p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 rounded-xl transition-all self-end"
                    title="Remove Book"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border border-dashed border-slate-200/80 dark:border-slate-800/60 p-6">
          <Book className="h-10 w-10 text-slate-350 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="font-bold text-slate-800 dark:text-slate-300">No books found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            We couldn't find any resources matching "{searchQuery}". Try modifying your search keywords or branch category.
          </p>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
