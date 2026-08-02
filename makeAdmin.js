const mongoose = require('mongoose');
require('dotenv').config();

async function makeAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const User = mongoose.model('User', new mongoose.Schema({
      email: String,
      role: String
    }));
    
    const result = await User.updateOne(
      { email: "justehien71@gmail.com" },
      { $set: { role: "admin" } }
    );
    
    console.log('✅ Utilisateur mis à jour:', result);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

makeAdmin();
