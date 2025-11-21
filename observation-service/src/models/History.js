import mongoose from 'mongoose';

const { Schema } = mongoose;

export const HistoryAction = {
  VALIDATED: 'VALIDATED',
  REJECTED: 'REJECTED',
  DELETED: 'DELETED',
  RESTORED: 'RESTORED'
};

const HistorySchema = new Schema({
  action: {
    type: String,
    enum: Object.values(HistoryAction),
    required: [true, 'L\'action est obligatoire']
  },
  performedBy: {
    type: String,
    required: [true, 'L\'ID de l\'utilisateur ayant effectué l\'action est obligatoire']
  },
  performedByRole: {
    type: String,
    required: [true, 'Le rôle de l\'utilisateur est obligatoire']
  },
  targetType: {
    type: String,
    enum: ['observation', 'species', 'user'],
    required: [true, 'Le type de cible est obligatoire']
  },
  targetId: {
    type: String,
    required: [true, 'L\'ID de la cible est obligatoire']
  },
  // Pour les observations
  observationAuthorId: {
    type: String,
    default: null
  },
  observationSpeciesId: {
    type: String,
    default: null
  },
  // Pour les species
  speciesName: {
    type: String,
    default: null
  },
  // Métadonnées supplémentaires
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour optimiser les recherches
HistorySchema.index({ targetId: 1, createdAt: -1 });
HistorySchema.index({ observationAuthorId: 1, createdAt: -1 });
HistorySchema.index({ observationSpeciesId: 1, createdAt: -1 });
HistorySchema.index({ performedBy: 1 });
HistorySchema.index({ action: 1 });

export const History = mongoose.model('History', HistorySchema);
