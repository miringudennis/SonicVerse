const db = require('./src/models/db');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const seed = async () => {
  try {
    console.log('Seeding SonicVerse Data...');

    // 1. Create Artist User
    const passwordHash = await bcrypt.hash('password123', 10);
    const user = await db.query(
      "INSERT INTO users (email, password_hash, role) VALUES ('artist@sonicverse.com', $1, 'artist') RETURNING id",
      [passwordHash]
    );
    const userId = user.rows[0].id;

    // 2. Create Profile
    const profile = await db.query(
      "INSERT INTO profiles (user_id, username, display_name, bio) VALUES ($1, 'synth_voyager', 'Synth Voyager', 'Exploring the digital frontiers of sound.') RETURNING id",
      [userId]
    );
    const profileId = profile.rows[0].id;

    // 3. Create Artist
    const artist = await db.query(
      "INSERT INTO artists (profile_id, verified, genre_tags) VALUES ($1, true, ARRAY['Synthwave', 'Electronic']) RETURNING id",
      [profileId]
    );
    const artistId = artist.rows[0].id;

    // 4. Create Songs
    await db.query(
      `INSERT INTO songs (artist_id, title, audio_url, cover_url, mood_tags) VALUES 
       ($1, 'Neon Dreams', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800', ARRAY['Energetic', 'Neon']),
       ($1, 'Cyber Beats', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800', ARRAY['Dark', 'Futuristic']),
       ($1, 'Digital Sunset', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', ARRAY['Chill', 'Euphoric'])`,
      [artistId]
    );

    // 5. Create Posts
    await db.query(
      "INSERT INTO posts (user_id, content) VALUES ($1, 'Just dropped some new synthwave vibes! Check out Neon Dreams on my profile.')",
      [userId]
    );

    console.log('Seeding Complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding Failed:', err);
    process.exit(1);
  }
};

seed();
