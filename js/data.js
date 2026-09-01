// Jeu de données véhicules électriques.
// `brand`/`factory` (pays de la marque, lieu d'assemblage) ont été renseignés
// manuellement lors de la conception : à vérifier avant mise en production.
export const CARS = [
  { code: "audi-q4", name: "Audi Q4 40 e-tron", consumption: 17.8, look: 4, power: 8.5, practicality: 3.5, price: 57600, quality: 4, range: 494, supercharge: 22, trunk: 520, volume: 13.99, surface: 8.58, brand: "Allemagne", factory: "Zwickau, Allemagne", fz: "UE" },
  { code: "audi-q4-sportback", name: "Audi Q4 40 e-tron Sportback", consumption: 17.8, look: 3.5, power: 6.2, practicality: 3.5, price: 60750, quality: 4, range: 494, supercharge: 22, trunk: 535, volume: 13.82, surface: 8.58, brand: "Allemagne", factory: "Zwickau, Allemagne", fz: "UE" },
  { code: "bmw-ix1", name: "BMW iX1", consumption: 17.9, look: 3.5, power: 5.6, practicality: 3.5, price: 62500, quality: 4.5, range: 420, supercharge: 23, trunk: 490, volume: 13.49, surface: 8.33, brand: "Allemagne", factory: "Ratisbonne, Allemagne", fz: "UE" },
  { code: "ford-mustang-mach-e-premium", name: "Ford Mustang Mach-E Premium 99kWh", consumption: 20.5, look: 3.5, power: 7, practicality: 3.5, price: 66990, quality: 4, range: 583, supercharge: 26, trunk: 502, volume: 13.64, surface: 8.80, brand: "États-Unis", factory: "Cuautitlán, Mexique", fz: "Hors UE" },
  { code: "hyundai-ioniq-5", name: "Hyundai Ioniq 5 (77,4 kWh - 2RM)", consumption: 20.3, look: 1.5, power: 7.3, practicality: 2.5, price: 55090, quality: 2, range: 518, supercharge: 20, trunk: 584, volume: 14.12, surface: 8.77, brand: "Corée du Sud", factory: "Ulsan, Corée du Sud", fz: "Hors UE" },
  { code: "kia-ev6", name: "Kia EV6 (77,4 kWh - 2RM)", consumption: 19.7, look: 2, power: 7, practicality: 2.5, price: 60090, quality: 3, range: 532, supercharge: 21, trunk: 572, volume: 13.64, surface: 8.80, brand: "Corée du Sud", factory: "Gwangmyeong, Corée du Sud", fz: "Hors UE" },
  { code: "mercedes-eqb-250", name: "Mercedes EQB 250", consumption: 19.8, look: 0.5, power: 8.9, practicality: 5, price: 63850, quality: 3.5, range: 478, supercharge: 30, trunk: 520, volume: 14.3, surface: 8.56, brand: "Allemagne", factory: "Kecskemét, Hongrie", fz: "UE" },
  { code: "renault-scenic-e-tech-87", name: "Renault Scenic E-Tech Grande Autonomie", consumption: 15.5, look: 3.5, power: 7.9, practicality: 4, price: 48640, quality: 3, range: 633, supercharge: 25, trunk: 545, volume: 13.1, surface: 8.33, brand: "France", factory: "Douai, France", fz: "France" },
  { code: "skoda-enyaq", name: "Skoda Enyaq iV 80", consumption: 19.2, look: 3.5, power: 8.6, practicality: 3, price: 57180, quality: 2.5, range: 520, supercharge: 27, trunk: 585, volume: 14.16, surface: 8.74, brand: "Tchéquie", factory: "Mladá Boleslav, Tchéquie", fz: "UE" },
  { code: "tesla-model-3", name: "Tesla Model 3 Grande Autonomie", consumption: 19.6, look: 5, power: 4.4, practicality: 1.5, price: 50990, quality: 3, range: 600, supercharge: 21, trunk: 542, volume: 12.49, surface: 8.68, brand: "États-Unis", factory: "Shanghai, Chine", fz: "Hors UE" },
  { code: "tesla-model-y", name: "Tesla Model Y Grande Autonomie", consumption: 17.6, look: 4, power: 5, practicality: 2, price: 52990, quality: 3.5, range: 510, supercharge: 21, trunk: 971, volume: 14.77, surface: 9.12, brand: "États-Unis", factory: "Berlin, Allemagne", fz: "UE" },
  { code: "volkswagen-id4", name: "Volkswagen ID4 Pro", consumption: 20.9, look: 3, power: 10.4, practicality: 3.5, price: 56620, quality: 2, range: 489, supercharge: 27, trunk: 543, volume: 13.9, surface: 8.47, brand: "Allemagne", factory: "Zwickau, Allemagne", fz: "UE" },
  { code: "volkswagen-id5", name: "Volkswagen ID5 Pro", consumption: 20.9, look: 3, power: 10.4, practicality: 3.5, price: 60690, quality: 2.5, range: 490, supercharge: 27, trunk: 549, volume: 13.7, surface: 8.51, brand: "Allemagne", factory: "Zwickau, Allemagne", fz: "UE" },
  { code: "volvo-xc40-recharge", name: "Volvo XC40 Recharge", consumption: 19.9, look: 3, power: 7.4, practicality: 3.5, price: 55260, quality: 3.5, range: 574, supercharge: 23, trunk: 452, volume: 13.89, surface: 8.42, brand: "Suède", factory: "Gand, Belgique", fz: "UE" }
].map(car => ({ ...car, chargeRate: (car.range * 0.6) / car.supercharge }));

export const ASSEMBLY_ZONES = ["France", "UE", "Hors UE"];

export const BRANDS = [...new Set(CARS.map(c => c.brand))].sort((a, b) => a.localeCompare(b, "fr"));
