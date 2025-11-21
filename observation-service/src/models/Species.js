import mongoose from 'mongoose';

const { Schema } = mongoose;

const SpeciesSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Le nom de l\'espèce est obligatoire'],
    trim: true
  },
  authorId: {
    type: String,
    required: [true, 'L\'ID de l\'auteur est obligatoire']
  },
  rarityScore: {
    type: Number,
    default: 1.0,
    min: [1, 'Le rarityScore ne peut pas être inférieur à 1']
  },
  deletedAt: {
    type: Date,
    default: null
  },
  deletedBy: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour optimiser les recherches
SpeciesSchema.index({ name: 1 }, { unique: true }); // Unique index défini ici
SpeciesSchema.index({ authorId: 1 });
SpeciesSchema.index({ rarityScore: -1 });

export const Species = mongoose.model('Species', SpeciesSchema);
