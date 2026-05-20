const fs = require('fs');

function patchFile(filepath, replacements) {
    if (!fs.existsSync(filepath)) return;
    let content = fs.readFileSync(filepath, 'utf8');
    for (const [find, replace] of replacements) {
        content = content.split(find).join(replace);
    }
    fs.writeFileSync(filepath, content);
}

// 1. AlumniDashboard.jsx
patchFile('frontend/src/pages/AlumniDashboard.jsx', [
    ['animate-pulse-slow', ''],
]);

// 2. MarketplacePage.jsx
patchFile('frontend/src/pages/MarketplacePage.jsx', [
    ['animate-pulse', ''],
]);

// 3. ComplaintDetailsPage.jsx
patchFile('frontend/src/pages/ComplaintDetailsPage.jsx', [
    ['animate-pulse', ''],
]);

// 4. FacultyDashboard.jsx
patchFile('frontend/src/pages/FacultyDashboard.jsx', [
    ['animate-pulse-slow', ''],
    ['<span className="text-3xl">{e.emoji || \'🎤\'}</span>', '<Calendar className="h-8 w-8 text-orange-500" />'],
    ['animate-pulse', '']
]);

// 5. ChatPage.jsx (Remove only the non-essential animations, keep the recording pulse and skeleton)
patchFile('frontend/src/pages/ChatPage.jsx', [
    ['animate-pulse" />', '" />'], // Award
    ['animate-bounce', ''], // MessageSquare empty state
]);

// 6. LibraryPage.jsx (Remove book emojis, pulse)
patchFile('frontend/src/pages/LibraryPage.jsx', [
    ["emoji: '📘',", ""],
    ["emoji: '📗',", ""],
    ["emoji: '📙',", ""],
    ["emoji: '📕',", ""],
    ["emoji: '📓',", ""],
    ["emoji: '📔',", ""],
    ["{book.emoji}", "<BookOpen className=\"h-8 w-8 text-indigo-500\" />"],
    ["bg-emerald-500 animate-pulse", "bg-emerald-500"],
    ["const emojis = ['📘', '📗', '📙', '📕', '📓', '📔'];", ""],
    ["const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];", ""],
    ["emoji: randomEmoji,", ""],
    ["emoji: '📘'", ""]
]);

// 7. ForgotPasswordPage.jsx
patchFile('frontend/src/pages/ForgotPasswordPage.jsx', [
    ['animate-bounce-slow', '']
]);

console.log('UI patches applied successfully');
