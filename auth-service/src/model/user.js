const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'L\'email est obligatoire'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir un email valide']
        },

        username: {
            type: String,
            required: [true, 'Le nom d\'utilisateur est obligatoire'],
            unique: true,
            trim: true,
            minlength: [3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'],
            maxlength: [50, 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères']
        },

        password: {
            type: String,
            required: [true, 'Le mot de passe est obligatoire'],
            minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
            select: false
        },

        role: {
            type: String,
            default: 'USER',
            enum: {
                values: ['USER', 'EXPERT', 'ADMIN'],
                message: 'Le rôle doit être USER, EXPERT ou ADMIN'
            }
        },

        reputation: {
            type: Number,
            default: 0,
            min: [0, 'La réputation ne peut pas être négative']
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
    },
    {
        timestamps: true,
        toJSON: {
            transform: function(doc, ret) {
                delete ret.__v;
                delete ret.password;
                return ret;
            }
        }
    }
);

// Hasher le mot de passe avant de sauvegarder
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(passwordToCompare) {
    try {
        return await bcryptjs.compare(passwordToCompare, this.password);
    } catch (err) {
        throw new Error('Erreur lors de la comparaison du mot de passe');
    }
};

// Méthodes statiques
userSchema.statics.findByRole = function(role) {
    return this.find({ role }).sort({ createdAt: -1 });
};

userSchema.statics.findByEmailOrUsername = function(identifier) {
    return this.findOne({
        $or: [{ email: identifier }, { username: identifier }]
    });
};

const User = mongoose.model('User', userSchema);

module.exports = User;

module.exports = User;