const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('./src/config/env');

const User = require('./src/models/User');
const Post = require('./src/models/Post');
const Comment = require('./src/models/Comment');
const FriendRequest = require('./src/models/FriendRequest');
const Message = require('./src/models/Message');
const Report = require('./src/models/Report');
const AuditLog = require('./src/models/AuditLog');

const seed = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      FriendRequest.deleteMany({}),
      Message.deleteMany({}),
      Report.deleteMany({}),
      AuditLog.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    const passwordHash = await bcrypt.hash('password123', 12);

    const users = await User.create([
      {
        name: 'Admin User', username: 'admin', email: 'admin@secureconnect.app',
        passwordHash, role: 'admin', isVerified: true, bio: 'Platform administrator',
      },
      {
        name: 'Moderator User', username: 'moderator', email: 'moderator@secureconnect.app',
        passwordHash, role: 'moderator', isVerified: true, bio: 'Content moderator',
      },
      {
        name: 'Alice Johnson', username: 'alice', email: 'alice@example.com',
        passwordHash, role: 'user', isVerified: true, bio: 'Software engineer & privacy advocate. Love hiking and photography.',
        privacySettings: { friendRequestWho: 'everyone', showFriendsList: 'friends', showEmail: 'only_me' },
      },
      {
        name: 'Bob Smith', username: 'bob', email: 'bob@example.com',
        passwordHash, role: 'user', isVerified: true, bio: 'Digital artist from Lagos. Exploring the intersection of art and tech.',
      },
      {
        name: 'Carol Williams', username: 'carol', email: 'carol@example.com',
        passwordHash, role: 'user', isVerified: true, bio: 'Cybersecurity researcher. PhD in Computer Science.',
      },
      {
        name: 'David Okafor', username: 'david', email: 'david@example.com',
        passwordHash, role: 'user', isVerified: true, bio: 'Full-stack developer. Open source contributor.',
      },
      {
        name: 'Eve Martins', username: 'eve', email: 'eve@example.com',
        passwordHash, role: 'user', isVerified: true, bio: 'UX designer crafting delightful experiences.',
      },
      {
        name: 'Frank Adeyemi', username: 'frank', email: 'frank@example.com',
        passwordHash, role: 'user', isVerified: false, bio: 'Student at YabaTech.',
      },
      {
        name: 'Grace Ogunlesi', username: 'grace', email: 'grace@example.com',
        passwordHash, role: 'user', isVerified: true, bio: 'Data scientist. Making sense of the numbers.',
      },
      {
        name: 'Henry Obi', username: 'henry', email: 'henry@example.com',
        passwordHash, role: 'user', isVerified: true, bio: 'Blockchain enthusiast and smart contract developer.',
      },
    ]);
    console.log(`Created ${users.length} users`);

    const [admin, moderator, alice, bob, carol, david, eve, frank, grace, henry] = users;

    const friendsData = [
      [alice._id, bob._id], [alice._id, carol._id], [alice._id, david._id],
      [bob._id, carol._id], [bob._id, eve._id], [carol._id, david._id],
      [carol._id, eve._id], [david._id, eve._id], [david._id, grace._id],
      [eve._id, grace._id], [grace._id, henry._id], [alice._id, grace._id],
    ];

    const friendRequests = await Promise.all(
      friendsData.map(([requester, recipient]) =>
        FriendRequest.create({ requester, recipient, status: 'accepted' })
      )
    );
    console.log(`Created ${friendRequests.length} friend connections`);

    const postSeeds = [
      { author: alice._id, content: 'Just finished reading "The Age of Surveillance Capitalism" by Shoshana Zuboff. Eye-opening perspective on how our data is being used. Highly recommend for anyone interested in digital privacy.', visibility: 'public' },
      { author: alice._id, content: 'Went hiking at Olumo Rock today. The view from the top was absolutely breathtaking! 🏔️', visibility: 'friends' },
      { author: alice._id, content: 'Working on a new privacy-focused feature for our platform. Excited to share it with everyone soon!', visibility: 'public' },
      { author: bob._id, content: 'Just finished a new digital art piece inspired by Lagos nightlife. Check it out! 🎨', visibility: 'public' },
      { author: bob._id, content: 'Looking for collaborators for an NFT art project. DM me if interested!', visibility: 'friends' },
      { author: bob._id, content: 'The tech scene in Lagos is growing so fast. So many amazing startups emerging.', visibility: 'public' },
      { author: carol._id, content: 'New paper published! "Analyzing Security Vulnerabilities in Modern Web Applications." Link in bio.', visibility: 'public' },
      { author: carol._id, content: 'Just discovered a critical vulnerability in a popular authentication library. Responsible disclosure process initiated.', visibility: 'friends' },
      { author: carol._id, content: 'Privacy is not secrecy. It\'s about having control over who knows what about you.', visibility: 'public' },
      { author: david._id, content: 'Contributed to an open-source project today. The feeling of giving back to the community is unmatched.', visibility: 'public' },
      { author: david._id, content: 'Building a new side project with Rust. The performance is incredible! 🚀', visibility: 'friends' },
      { author: eve._id, content: 'Just redesigned our company\'s dashboard. User research really makes a difference in UX decisions.', visibility: 'public' },
      { author: eve._id, content: 'Attending a design workshop this weekend. Anyone else going?', visibility: 'friends' },
      { author: frank._id, content: 'Submitted my final year project today! What a relief. 😅', visibility: 'public' },
      { author: grace._id, content: 'New blog post: "How I Use Machine Learning to Analyze Social Media Trends." Check it out!', visibility: 'public' },
      { author: grace._id, content: 'Data visualization tip: Use colorblind-friendly palettes. Your charts will be accessible to more people.', visibility: 'public' },
      { author: henry._id, content: 'The future of decentralized identity is bright. Self-sovereign identity will change how we interact online.', visibility: 'public' },
      { author: henry._id, content: 'Smart contract audit completed. Always audit your code before deploying to mainnet!', visibility: 'friends' },
      { author: alice._id, content: 'This is a personal note. Just for me to remember.', visibility: 'only_me' },
      { author: carol._id, content: 'For my closest friends only: I\'m launching a cybersecurity workshop series next month!', visibility: 'custom', customAudience: [alice._id, david._id] },
    ];

    const posts = await Post.create(postSeeds.map(p => ({
      ...p,
      customAudience: p.customAudience || [],
    })));
    console.log(`Created ${posts.length} posts`);

    const commentSeeds = [
      { post: posts[0]._id, author: bob._id, content: 'Great book! I learned so much from it too.' },
      { post: posts[0]._id, author: carol._id, content: 'One of my favorites! The concept of "behavioral surplus" is mind-blowing.' },
      { post: posts[1]._id, author: bob._id, content: 'The view looks amazing! I need to visit someday.' },
      { post: posts[3]._id, author: alice._id, content: 'Your art keeps getting better! Love the colors.' },
      { post: posts[3]._id, author: david._id, content: 'This is stunning. Would love to see more of your work.' },
      { post: posts[4]._id, author: eve._id, content: 'Interested! Let\'s talk more about this.' },
      { post: posts[6]._id, author: alice._id, content: 'Congratulations on the publication! 🎉' },
      { post: posts[6]._id, author: david._id, content: 'Can\'t wait to read it. Congrats!' },
      { post: posts[9]._id, author: alice._id, content: 'Which project? Would love to contribute too.' },
      { post: posts[9]._id, author: eve._id, content: 'Open source is the best! 💪' },
      { post: posts[11]._id, author: alice._id, content: 'Would love to see the before and after!' },
      { post: posts[11]._id, author: david._id, content: 'UX research is so underrated. Glad it\'s getting attention.' },
      { post: posts[13]._id, author: alice._id, content: 'Congratulations Frank! All the best 🎉' },
      { post: posts[13]._id, author: bob._id, content: 'Well done! What was your project about?' },
      { post: posts[14]._id, author: alice._id, content: 'Great article Grace! Shared it with my team.' },
      { post: posts[16]._id, author: alice._id, content: 'Interesting take. But how do we handle key recovery?' },
      { post: posts[16]._id, author: carol._id, content: 'Self-sovereign identity has so much potential. Great post!' },
    ];

    await Comment.create(commentSeeds);
    await Post.updateMany(
      { _id: { $in: [...new Set(commentSeeds.map(c => c.post))] } },
      { $inc: { commentsCount: 1 } }
    );
    console.log(`Created ${commentSeeds.length} comments`);

    const alicePublicKey = 'VGVzdFB1YmxpY0tleUFsaWNl';
    const bobPublicKey = 'VGVzdFB1YmxpY0tleUJvYg==';
    const carolPublicKey = 'VGVzdFB1YmxpY0tleUNhcm9s';

    await User.updateOne({ _id: alice._id }, { publicKey: alicePublicKey });
    await User.updateOne({ _id: bob._id }, { publicKey: bobPublicKey });
    await User.updateOne({ _id: carol._id }, { publicKey: carolPublicKey });

    const messageSeeds = [
      { sender: alice._id, recipient: bob._id, ciphertext: 'SGVsbG8gQm9iISBIb3cgYXJlIHlvdSB0b2RheT8=', nonce: 'bm9uY2Ux', createdAt: new Date(Date.now() - 86400000 * 3) },
      { sender: bob._id, recipient: alice._id, ciphertext: 'SSdtIGdyZWF0ISBXb3JraW5nIG9uIGEgbmV3IHBpZWNlLg==', nonce: 'bm9uY2Uy', createdAt: new Date(Date.now() - 86400000 * 3 + 3600000) },
      { sender: alice._id, recipient: bob._id, ciphertext: 'Q2FuIEkgc2VlIGl0PyBJIGxvdmUgeW91ciB3b3JrIQ==', nonce: 'bm9uY2Uz', createdAt: new Date(Date.now() - 86400000 * 2) },
      { sender: alice._id, recipient: carol._id, ciphertext: 'SGV5IENhcm9sISBHcmVhdCBwYXBlciBvbiB0aGUgdnVsbmVyYWJpbGl0eSE=', nonce: 'bm9uY2U0', createdAt: new Date(Date.now() - 86400000) },
      { sender: carol._id, recipient: alice._id, ciphertext: 'VGhhbmtzIEFsaWNlISBZb3VyIHN1cHBvcnQgbWVhbnMgYSBsb3Qu', nonce: 'bm9uY2U1', createdAt: new Date(Date.now() - 43200000) },
      { sender: david._id, recipient: eve._id, ciphertext: 'SG93J3MgdGhlIFVYIHByb2plY3QgZ29pbmc/', nonce: 'bm9uY2U2', createdAt: new Date(Date.now() - 7200000) },
    ];

    await Message.create(messageSeeds);
    console.log(`Created ${messageSeeds.length} messages`);

    const reportSeeds = [
      {
        reporter: alice._id, targetType: 'post', targetId: posts[14]._id,
        reason: 'This post contains misleading information about data privacy.',
        status: 'pending',
      },
      {
        reporter: bob._id, targetType: 'user', targetId: frank._id,
        reason: 'This user is spamming friend requests.',
        status: 'pending',
      },
    ];

    await Report.create(reportSeeds);
    console.log(`Created ${reportSeeds.length} reports`);

    await AuditLog.create([
      { user: admin._id, action: 'SYSTEM_SEED', ipAddress: '127.0.0.1', userAgent: 'seed-script' },
    ]);

    console.log('\n=== SEED COMPLETE ===');
    console.log('Login credentials for all users:');
    console.log('  Email: any user email (e.g., alice@example.com)');
    console.log('  Password: password123');
    console.log('  Admin: admin@secureconnect.app / password123');
    console.log('  Moderator: moderator@secureconnect.app / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
