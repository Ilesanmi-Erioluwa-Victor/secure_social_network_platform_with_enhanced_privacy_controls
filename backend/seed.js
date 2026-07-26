const mongoose = require('mongoose');
const User = require('./src/models/User');
const Post = require('./src/models/Post');
const Comment = require('./src/models/Comment');
const FriendRequest = require('./src/models/FriendRequest');
const Message = require('./src/models/Message');
const Report = require('./src/models/Report');
const AuditLog = require('./src/models/AuditLog');

const seed = async (mongoUri) => {
  try {
    const shouldConnect = mongoUri || !mongoose.connection.readyState;
    if (shouldConnect) {
      const config = require('./src/config/env');
      await mongoose.connect(mongoUri || config.mongoUri);
      console.log('Connected to MongoDB');
    }

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

    const users = await User.create([
      {
        name: 'Admin User', username: 'admin', email: 'admin@secureconnect.app',
        passwordHash: 'password123', role: 'admin', isVerified: true, bio: 'Platform administrator',
      },
      {
        name: 'Moderator User', username: 'moderator', email: 'moderator@secureconnect.app',
        passwordHash: 'password123', role: 'moderator', isVerified: true, bio: 'Content moderator',
      },
      {
        name: 'Alice Johnson', username: 'alice', email: 'alice@example.com',
        passwordHash: 'password123', role: 'user', isVerified: true, bio: 'Software engineer & privacy advocate. Love hiking and photography.',
        privacySettings: { friendRequestWho: 'everyone', showFriendsList: 'friends', showEmail: 'only_me' },
      },
      {
        name: 'Bob Smith', username: 'bob', email: 'bob@example.com',
        passwordHash: 'password123', role: 'user', isVerified: true, bio: 'Digital artist from Lagos. Exploring the intersection of art and tech.',
      },
      {
        name: 'Carol Williams', username: 'carol', email: 'carol@example.com',
        passwordHash: 'password123', role: 'user', isVerified: true, bio: 'Cybersecurity researcher. PhD in Computer Science.',
      },
      {
        name: 'David Okafor', username: 'david', email: 'david@example.com',
        passwordHash: 'password123', role: 'user', isVerified: true, bio: 'Full-stack developer. Open source contributor.',
      },
      {
        name: 'Eve Martins', username: 'eve', email: 'eve@example.com',
        passwordHash: 'password123', role: 'user', isVerified: true, bio: 'UX designer crafting delightful experiences.',
      },
      {
        name: 'Frank Adeyemi', username: 'frank', email: 'frank@example.com',
        passwordHash: 'password123', role: 'user', isVerified: false, bio: 'Student at YabaTech.',
      },
      {
        name: 'Grace Ogunlesi', username: 'grace', email: 'grace@example.com',
        passwordHash: 'password123', role: 'user', isVerified: true, bio: 'Data scientist. Making sense of the numbers.',
      },
      {
        name: 'Henry Obi', username: 'henry', email: 'henry@example.com',
        passwordHash: 'password123', role: 'user', isVerified: true, bio: 'Blockchain enthusiast and smart contract developer.',
      },
      {
        name: 'Ivy Nwachukwu', username: 'ivy', email: 'ivy@example.com',
        passwordHash: 'password123', role: 'user', isVerified: true, bio: 'Photographer & visual storyteller. Capturing moments that matter.',
      },
      {
        name: 'Jack Ogunlade', username: 'jack', email: 'jack@example.com',
        passwordHash: 'password123', role: 'user', isVerified: true, bio: 'Product manager passionate about building things people love.',
      },
      {
        name: 'Karen Obi', username: 'karen', email: 'karen@example.com',
        passwordHash: 'password123', role: 'user', isVerified: true, bio: 'AI/ML engineer. Building the future one model at a time.',
      },
      {
        name: 'Leo Adekunle', username: 'leo', email: 'leo@example.com',
        passwordHash: 'password123', role: 'user', isVerified: true, bio: 'DevOps engineer keeping the infrastructure running.',
      },
      {
        name: 'Mona Isaacs', username: 'mona', email: 'mona@example.com',
        passwordHash: 'password123', role: 'user', isVerified: true, bio: 'Technical writer making complex topics simple.',
      },
    ]);
    console.log(`Created ${users.length} users`);

    const [admin, moderator, alice, bob, carol, david, eve, frank, grace, henry, ivy, jack, karen, leo, mona] = users;

    const friendsData = [
      [alice._id, bob._id], [alice._id, carol._id], [alice._id, david._id],
      [bob._id, carol._id], [bob._id, eve._id], [carol._id, david._id],
      [carol._id, eve._id], [david._id, eve._id], [david._id, grace._id],
      [eve._id, grace._id], [grace._id, henry._id], [alice._id, grace._id],
      [ivy._id, jack._id], [ivy._id, alice._id], [jack._id, karen._id],
      [karen._id, leo._id], [leo._id, mona._id], [mona._id, ivy._id],
      [bob._id, ivy._id], [carol._id, karen._id], [david._id, leo._id],
      [eve._id, mona._id], [henry._id, jack._id], [frank._id, alice._id],
    ];

    const friendRequests = await Promise.all(
      friendsData.map(([requester, recipient]) =>
        FriendRequest.create({ requester, recipient, status: 'accepted' })
      )
    );
    console.log(`Created ${friendRequests.length} friend connections`);

    const placeholderImages = [
      'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/architecture-signs',
      'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/beach-boat',
      'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/nature-mountains',
      'https://res.cloudinary.com/demo/image/upload/v1/samples/food/fish-vegetables',
      'https://res.cloudinary.com/demo/image/upload/v1/samples/people/kitchen-party',
      'https://res.cloudinary.com/demo/image/upload/v1/samples/animals/cat',
      'https://res.cloudinary.com/demo/image/upload/v1/samples/landscapes/cityscape',
      'https://res.cloudinary.com/demo/image/upload/v1/samples/coffee',
    ];

    const postSeeds = [
      { author: alice._id, content: 'Just finished reading "The Age of Surveillance Capitalism" by Shoshana Zuboff. Eye-opening perspective on how our data is being used. Highly recommend for anyone interested in digital privacy.', visibility: 'public', mediaUrls: [] },
      { author: alice._id, content: 'Went hiking at Olumo Rock today. The view from the top was absolutely breathtaking! 🏔️', visibility: 'friends', mediaUrls: [placeholderImages[0]] },
      { author: alice._id, content: 'Working on a new privacy-focused feature for our platform. Excited to share it with everyone soon!', visibility: 'public', mediaUrls: [] },
      { author: bob._id, content: 'Just finished a new digital art piece inspired by Lagos nightlife. Check it out! 🎨', visibility: 'public', mediaUrls: [placeholderImages[4], placeholderImages[6]] },
      { author: bob._id, content: 'Looking for collaborators for an NFT art project. DM me if interested!', visibility: 'friends', mediaUrls: [] },
      { author: bob._id, content: 'The tech scene in Lagos is growing so fast. So many amazing startups emerging.', visibility: 'public', mediaUrls: [] },
      { author: carol._id, content: 'New paper published! "Analyzing Security Vulnerabilities in Modern Web Applications." Link in bio.', visibility: 'public', mediaUrls: [] },
      { author: carol._id, content: 'Just discovered a critical vulnerability in a popular authentication library. Responsible disclosure process initiated.', visibility: 'friends', mediaUrls: [] },
      { author: carol._id, content: 'Privacy is not secrecy. It\'s about having control over who knows what about you.', visibility: 'public', mediaUrls: [] },
      { author: david._id, content: 'Contributed to an open-source project today. The feeling of giving back to the community is unmatched.', visibility: 'public', mediaUrls: [] },
      { author: david._id, content: 'Building a new side project with Rust. The performance is incredible! 🚀', visibility: 'friends', mediaUrls: [] },
      { author: eve._id, content: 'Just redesigned our company\'s dashboard. User research really makes a difference in UX decisions.', visibility: 'public', mediaUrls: [placeholderImages[7], placeholderImages[3]] },
      { author: eve._id, content: 'Attending a design workshop this weekend. Anyone else going?', visibility: 'friends', mediaUrls: [] },
      { author: frank._id, content: 'Submitted my final year project today! What a relief. 😅', visibility: 'public', mediaUrls: [] },
      { author: grace._id, content: 'New blog post: "How I Use Machine Learning to Analyze Social Media Trends." Check it out!', visibility: 'public', mediaUrls: [] },
      { author: grace._id, content: 'Data visualization tip: Use colorblind-friendly palettes. Your charts will be accessible to more people.', visibility: 'public', mediaUrls: [] },
      { author: henry._id, content: 'The future of decentralized identity is bright. Self-sovereign identity will change how we interact online.', visibility: 'public', mediaUrls: [] },
      { author: henry._id, content: 'Smart contract audit completed. Always audit your code before deploying to mainnet!', visibility: 'friends', mediaUrls: [] },
      { author: alice._id, content: 'This is a personal note. Just for me to remember.', visibility: 'only_me', mediaUrls: [] },
      { author: carol._id, content: 'For my closest friends only: I\'m launching a cybersecurity workshop series next month!', visibility: 'custom', customAudience: [alice._id, david._id], mediaUrls: [] },
      { author: ivy._id, content: 'Golden hour at the beach today. Nature never disappoints! 📸', visibility: 'public', mediaUrls: [placeholderImages[1], placeholderImages[5], placeholderImages[2]] },
      { author: ivy._id, content: 'Behind the scenes from yesterday\'s photoshoot. Such a creative team!', visibility: 'friends', mediaUrls: [placeholderImages[4]] },
      { author: jack._id, content: 'Just shipped a major feature update. Proud of what the team accomplished this quarter!', visibility: 'public', mediaUrls: [] },
      { author: jack._id, content: 'Reading "Inspired" by Marty Cagan. Every product manager should read this.', visibility: 'public', mediaUrls: [] },
      { author: karen._id, content: 'Training a new computer vision model for medical imaging. The accuracy improvements are promising.', visibility: 'public', mediaUrls: [] },
      { author: karen._id, content: 'Just published a paper on federated learning for healthcare data. Maintaining privacy while advancing medicine.', visibility: 'friends', mediaUrls: [] },
      { author: leo._id, content: 'Migrated our entire infrastructure to Kubernetes. Everything is running smoothly.', visibility: 'public', mediaUrls: [] },
      { author: leo._id, content: 'Pro tip: always use Terraform for infrastructure as code. Your future self will thank you.', visibility: 'public', mediaUrls: [] },
      { author: mona._id, content: 'New article: "The Complete Guide to API Documentation." Check it out on my blog!', visibility: 'public', mediaUrls: [placeholderImages[7]] },
      { author: mona._id, content: 'Good documentation is like a good conversation — clear, concise, and helpful.', visibility: 'public', mediaUrls: [] },
      { author: alice._id, content: 'Sunrise hike with friends. 5am starts are worth it for views like this! 🌅', visibility: 'public', mediaUrls: [placeholderImages[2], placeholderImages[1]] },
      { author: bob._id, content: 'New artwork unveiled at the gallery opening tonight. So grateful for all the support!', visibility: 'public', mediaUrls: [placeholderImages[6], placeholderImages[4], placeholderImages[0]] },
    ];

    const posts = await Post.create(postSeeds.map(p => ({
      ...p,
      mediaUrls: p.mediaUrls || [],
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
      { post: posts[20]._id, author: alice._id, content: 'Stunning shots Ivy! Your photography keeps getting better.' },
      { post: posts[20]._id, author: jack._id, content: 'Wow, where is this beach? Need to visit!' },
      { post: posts[22]._id, author: ivy._id, content: 'Congrats Jack! What was the feature about?' },
      { post: posts[24]._id, author: leo._id, content: 'That\'s going to save so many lives. Amazing work Karen!' },
      { post: posts[26]._id, author: jack._id, content: 'Nice work Leo! K8s migration is no small feat.' },
      { post: posts[28]._id, author: ivy._id, content: 'This is so helpful! Saved for reference.' },
      { post: posts[30]._id, author: bob._id, content: 'That sunrise is incredible! Where was this?' },
      { post: posts[30]._id, author: carol._id, content: 'Worth every early morning for views like that!' },
      { post: posts[31]._id, author: alice._id, content: 'The gallery show was fantastic! So proud of you Bob!' },
      { post: posts[31]._id, author: ivy._id, content: 'Your best work yet! The colors are mesmerizing.' },
      { post: posts[25]._id, author: alice._id, content: 'Federated learning + healthcare = such an important combination. Keep it up!' },
      { post: posts[23]._id, author: mona._id, content: 'Adding this to my reading list. Thanks for the recommendation!' },
      { post: posts[29]._id, author: karen._id, content: 'Wise words from the best technical writer I know!' },
    ];

    await Comment.create(commentSeeds);

    const postCommentCounts = {};
    commentSeeds.forEach(c => {
      postCommentCounts[c.post] = (postCommentCounts[c.post] || 0) + 1;
    });
    await Promise.all(
      Object.entries(postCommentCounts).map(([postId, count]) =>
        Post.updateOne({ _id: postId }, { $inc: { commentsCount: count } })
      )
    );
    console.log(`Created ${commentSeeds.length} comments`);

    const alicePublicKey = 'VGVzdFB1YmxpY0tleUFsaWNl';
    const bobPublicKey = 'VGVzdFB1YmxpY0tleUJvYg==';
    const carolPublicKey = 'VGVzdFB1YmxpY0tleUNhcm9s';
    const ivyPublicKey = 'VGVzdFB1YmxpY0tleUl2eQ==';
    const jackPublicKey = 'VGVzdFB1YmxpY0tleUphY2s=';

    await User.updateOne({ _id: alice._id }, { publicKey: alicePublicKey });
    await User.updateOne({ _id: bob._id }, { publicKey: bobPublicKey });
    await User.updateOne({ _id: carol._id }, { publicKey: carolPublicKey });
    await User.updateOne({ _id: ivy._id }, { publicKey: ivyPublicKey });
    await User.updateOne({ _id: jack._id }, { publicKey: jackPublicKey });

    const messageSeeds = [
      { sender: alice._id, recipient: bob._id, ciphertext: 'SGVsbG8gQm9iISBIb3cgYXJlIHlvdSB0b2RheT8=', nonce: 'bm9uY2Ux', createdAt: new Date(Date.now() - 86400000 * 3) },
      { sender: bob._id, recipient: alice._id, ciphertext: 'SSdtIGdyZWF0ISBXb3JraW5nIG9uIGEgbmV3IHBpZWNlLg==', nonce: 'bm9uY2Uy', createdAt: new Date(Date.now() - 86400000 * 3 + 3600000) },
      { sender: alice._id, recipient: bob._id, ciphertext: 'Q2FuIEkgc2VlIGl0PyBJIGxvdmUgeW91ciB3b3JrIQ==', nonce: 'bm9uY2Uz', createdAt: new Date(Date.now() - 86400000 * 2) },
      { sender: alice._id, recipient: carol._id, ciphertext: 'SGV5IENhcm9sISBHcmVhdCBwYXBlciBvbiB0aGUgdnVsbmVyYWJpbGl0eSE=', nonce: 'bm9uY2U0', createdAt: new Date(Date.now() - 86400000) },
      { sender: carol._id, recipient: alice._id, ciphertext: 'VGhhbmtzIEFsaWNlISBZb3VyIHN1cHBvcnQgbWVhbnMgYSBsb3Qu', nonce: 'bm9uY2U1', createdAt: new Date(Date.now() - 43200000) },
      { sender: david._id, recipient: eve._id, ciphertext: 'SG93J3MgdGhlIFVYIHByb2plY3QgZ29pbmc/', nonce: 'bm9uY2U2', createdAt: new Date(Date.now() - 7200000) },
      { sender: ivy._id, recipient: alice._id, ciphertext: 'SGkgQWxpY2UhIExvdmUgeW91ciBoaWtpbmcgcGhvdG9zIQ==', nonce: 'bm9uY2U3', createdAt: new Date(Date.now() - 86400000 * 1.5) },
      { sender: alice._id, recipient: ivy._id, ciphertext: 'VGhhbmtzIEl2eSEgWW91ciBiZWFjaCBwaG90b3MgYXJlIGFtYXppbmcgdG9vIQ==', nonce: 'bm9uY2U4', createdAt: new Date(Date.now() - 86400000 + 7200000) },
      { sender: jack._id, recipient: karen._id, ciphertext: 'SGV5IEthcmVuISBHcmVhdCBwYXBlciBvbiBmZWRlcmF0ZWQgbGVhcm5pbmch', nonce: 'bm9uY2U5', createdAt: new Date(Date.now() - 3600000) },
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
      {
        reporter: carol._id, targetType: 'post', targetId: posts[5]._id,
        reason: 'Inappropriate content in this post.',
        status: 'dismissed',
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
    console.log('\nNew users added:');
    console.log('  ivy@example.com (Ivy Nwachukwu) — Photographer');
    console.log('  jack@example.com (Jack Ogunlade) — Product Manager');
    console.log('  karen@example.com (Karen Obi) — AI/ML Engineer');
    console.log('  leo@example.com (Leo Adekunle) — DevOps Engineer');
    console.log('  mona@example.com (Mona Isaacs) — Technical Writer');

    console.log('Seed complete');
    return true;
  } catch (error) {
    console.error('Seed error:', error);
    throw error;
  }
};

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seed;
