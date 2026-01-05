import mongoose from 'mongoose';

const repairCostSchema = new mongoose.Schema({
  serviceType: { 
    type: String, 
    required: true,
    enum: ['hull_repair', 'engine_repair', 'electrical_repair', 'maintenance', 'inspection']
  },
  repairType: { 
    type: String, 
    required: true,
    enum: ['Minor', 'Major', 'Regular', 'Standard']
  },
  estimatedCost: { 
    type: Number, 
    required: true,
    min: 0
  },
  description: { 
    type: String, 
    required: true 
  }
}, {
  timestamps: true
});

const RepairCostList = mongoose.model('RepairCostList', repairCostSchema);

export default RepairCostList;
