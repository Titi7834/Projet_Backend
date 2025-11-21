import mongoose from 'mongoose';

const { Schema } = mongoose;

export const ObservationStatus = {
  PENDING: 'PENDING',
  VALIDATED: 'VALIDATED',
  REJECTED: 'REJECTED'
};

const ObservationSchema = new Schema({
  speciesId: {
    type: String,
    required: [true, 'L\'ID de l\'espèce est obligatoire'],
    ref: 'Species'
  },
  authorId: {
    type: String,
    required: [true, 'L\'ID de l\'auteur est obligatoire']
  },
  description: {
    type: String,
    required: [true, 'La description est obligatoire'],
    trim: true,
    minlength: [10, 'La description doit contenir au moins 10 caractères']
  },
  dangerLevel: {
    type: Number,
    required: [true, 'Le niveau de danger est obligatoire'],
    min: [1, 'Le niveau de danger doit être compris entre 1 et 5'],
    max: [5, 'Le niveau de danger doit être compris entre 1 et 5']
  },
  status: {
    type: String,
    enum: Object.values(ObservationStatus),
    default: ObservationStatus.PENDING
  },
  validatedBy: {
    type: String,
    default: null
  },
  validatedAt: {
    type: Date,
    default: null
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
ObservationSchema.index({ speciesId: 1 });
ObservationSchema.index({ authorId: 1 });
ObservationSchema.index({ status: 1 });
ObservationSchema.index({ createdAt: -1 });
// Index composé pour la règle des 5 minutes
ObservationSchema.index({ authorId: 1, speciesId: 1, createdAt: -1 });

export const Observation = mongoose.model('Observation', ObservationSchema);
