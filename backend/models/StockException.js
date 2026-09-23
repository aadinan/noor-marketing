const mongoose = require('mongoose');

const StockExceptionSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    systemCount: { type: Number, required: true },
    actualCount: { type: Number, required: true },
    discrepancy: { type: Number, required: true }, // actualCount - systemCount

    photoProofUrl: { type: String }, // Link to S3 or local storage
    notes: { type: String },

    status: {
        type: String,
        enum: ['PENDING_REVIEW', 'APPROVED_ADJUSTMENT', 'REJECTED'],
        default: 'PENDING_REVIEW'
    },

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('StockException', StockExceptionSchema);
