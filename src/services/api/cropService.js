import cropsData from "@/services/mockData/crops.json";

class CropService {
  constructor() {
    this.crops = [...cropsData];
  }

  async delay(ms = 300) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getAll() {
    await this.delay();
    return [...this.crops];
  }

  async getById(id) {
    await this.delay();
    const crop = this.crops.find(c => c.Id === parseInt(id));
    if (!crop) {
      throw new Error("Crop not found");
    }
    return { ...crop };
  }

async create(cropData) {
    await this.delay();
    const maxId = Math.max(...this.crops.map(c => c.Id), 0);
    const plantingDate = cropData.plantingDate || new Date().toISOString();
    const newCrop = {
      Id: maxId + 1,
      ...cropData,
      fieldId: parseInt(cropData.fieldId),
      fieldName: cropData.fieldName || "",
      plantingDate,
      status: cropData.status || "planted",
      growthStage: "Planted",
      stageHistory: [{
        stage: "Planted",
        date: plantingDate,
        updatedAt: new Date().toISOString()
      }]
    };
    this.crops.push(newCrop);
    return { ...newCrop };
  }

async update(id, cropData) {
    await this.delay();
    const index = this.crops.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Crop not found");
    }
    
    const existingCrop = this.crops[index];
    let updatedCrop = { 
      ...existingCrop, 
      ...cropData,
      fieldId: cropData.fieldId ? parseInt(cropData.fieldId) : existingCrop.fieldId,
      fieldName: cropData.fieldName || existingCrop.fieldName
    };

    // Handle growth stage updates
    if (cropData.growthStage && cropData.growthStage !== existingCrop.growthStage) {
      const stageHistory = existingCrop.stageHistory || [];
      updatedCrop.stageHistory = [
        ...stageHistory,
        {
          stage: cropData.growthStage,
          date: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
    
    this.crops[index] = updatedCrop;
    return { ...updatedCrop };
  }

  async delete(id) {
    await this.delay();
    const index = this.crops.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Crop not found");
    }
    const deletedCrop = this.crops.splice(index, 1)[0];
    return { ...deletedCrop };
  }

  async getStats() {
    await this.delay();
    const totalCrops = this.crops.length;
    const activeCrops = this.crops.filter(c => c.status === "growing" || c.status === "planted").length;
    const readyToHarvest = this.crops.filter(c => c.status === "ready").length;
    const harvested = this.crops.filter(c => c.status === "harvested").length;

    return {
      totalCrops,
      activeCrops,
      readyToHarvest,
      harvested
    };
  }
}

export default new CropService();