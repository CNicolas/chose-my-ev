// Jeu de données véhicules électriques 5 portes / 5 places.
// Prix réajustés (~75% de la configuration max avec options).
// Les modèles d'origine restent inchangés.
//
// `price` inclut désormais, pour tous les modèles hors "(Origine)", le surcoût
// estimé des 3 équipements exigés : caméra de recul, détection d'angles morts
// et sièges avant électriques à mémoire. Le surcoût correspond, selon la marque,
// à l'option seule, au pack qui la contient, ou au saut de finition nécessaire
// (les sièges à mémoire n'étant généralement proposés qu'en haut de gamme).
// Les modèles dont le catalogue ne propose aucun des 3 équipements, à aucun prix,
// sont exclus du jeu de données (BYD Atto 2/Atto 3/Dolphin, Citroën ë-C4 et ë-C4 X,
// DS 3 E-Tense, Fiat 600e, Kia EV2, MG4, Peugeot e-208 : pas de sièges à mémoire).
// Surcoûts constatés : 0 € (déjà de série) à 3 000 €.
//
// `look` et `quality` sont des appréciations personnelles. Pour les modèles ajoutés
// sans notation d'origine, elles sont calquées sur le modèle le plus proche de la
// même marque déjà noté (ex. ID.3 aligné sur ID4, iX2 sur iX1) : à réévaluer.
// Estimations tarifaires et disponibilités à revalider avant mise en production.
export const CARS = [
    // --- ALFA ROMEO ---
    { code: "alfa-junior-elettrica", name: "Alfa Romeo Junior Elettrica", consumption: 15.2, look: 4.0, power: 7.8, practicality: 3.5, price: 46500, quality: 3.8, range: 410, supercharge: 27, trunk: 400, volume: 11.80, surface: 7.70, brand: "Italie", factory: "Tychy, Pologne", fz: "UE" },

    // --- AUDI (Origine) ---
    { code: "audi-q4", name: "Audi Q4 40 e-tron", consumption: 17.8, look: 4.0, power: 8.5, practicality: 3.5, price: 57600, quality: 4.0, range: 494, supercharge: 22, trunk: 520, volume: 13.99, surface: 8.58, brand: "Allemagne", factory: "Zwickau, Allemagne", fz: "UE" },
    { code: "audi-q4-sportback", name: "Audi Q4 40 e-tron Sportback", consumption: 17.8, look: 3.5, power: 6.2, practicality: 3.5, price: 60750, quality: 4.0, range: 494, supercharge: 22, trunk: 535, volume: 13.82, surface: 8.58, brand: "Allemagne", factory: "Zwickau, Allemagne", fz: "UE" },

    // --- BMW ---
    { code: "bmw-ix1", name: "BMW iX1", consumption: 17.9, look: 3.5, power: 5.6, practicality: 3.5, price: 62500, quality: 4.5, range: 420, supercharge: 23, trunk: 490, volume: 13.49, surface: 8.33, brand: "Allemagne", factory: "Ratisbonne, Allemagne", fz: "UE" }, // Origine
    { code: "bmw-ix2", name: "BMW iX2 eDrive20", consumption: 15.7, look: 3.5, power: 8.6, practicality: 3.5, price: 52300, quality: 4.5, range: 478, supercharge: 29, trunk: 525, volume: 13.23, surface: 8.40, brand: "Allemagne", factory: "Ratisbonne, Allemagne", fz: "UE" },
    { code: "bmw-i4", name: "BMW i4 eDrive40", consumption: 15.4, look: 4.0, power: 5.7, practicality: 3.5, price: 64300, quality: 4.5, range: 590, supercharge: 31, trunk: 470, volume: 12.83, surface: 8.86, brand: "Allemagne", factory: "Munich, Allemagne", fz: "UE" },

    // --- BYD ---
    { code: "byd-seal", name: "BYD Seal Design RWD", consumption: 15.9, look: 4.5, power: 5.9, practicality: 3.0, price: 49500, quality: 4.0, range: 570, supercharge: 26, trunk: 400, volume: 13.14, surface: 9.00, brand: "Chine", factory: "Changzhou, Chine", fz: "Hors UE" },
    { code: "byd-seal-u", name: "BYD Seal U Design", consumption: 20.5, look: 3.5, power: 9.6, practicality: 4.0, price: 44000, quality: 3.5, range: 500, supercharge: 28, trunk: 552, volume: 15.08, surface: 9.04, brand: "Chine", factory: "Shenzhen, Chine", fz: "Hors UE" },
    { code: "byd-sealion-7", name: "BYD Sealion 7 Comfort", consumption: 16.5, look: 4.0, power: 6.7, practicality: 4.0, price: 46990, quality: 3.8, range: 605, supercharge: 32, trunk: 500, volume: 15.06, surface: 9.30, brand: "Chine", factory: "Zhengzhou, Chine", fz: "Hors UE" },

    // --- CITROËN ---
    { code: "citroen-e-c5-aircross", name: "Citroën ë-C5 Aircross 73 kWh", consumption: 16.5, look: 3.5, power: 8.5, practicality: 4.5, price: 50900, quality: 3.5, range: 520, supercharge: 27, trunk: 565, volume: 15.17, surface: 8.97, brand: "France", factory: "Rennes, France", fz: "France" },

    // --- CUPRA ---
    { code: "cupra-born-77", name: "Cupra Born VZ 77 kWh", consumption: 15.8, look: 4.0, power: 6.6, practicality: 3.5, price: 52300, quality: 3.8, range: 550, supercharge: 28, trunk: 385, volume: 12.30, surface: 7.80, brand: "Espagne", factory: "Zwickau, Allemagne", fz: "UE" },
    { code: "cupra-tavascan-vz", name: "Cupra Tavascan VZ", consumption: 16.8, look: 4.5, power: 5.5, practicality: 4.0, price: 64500, quality: 4.0, range: 522, supercharge: 28, trunk: 540, volume: 14.20, surface: 8.60, brand: "Espagne", factory: "Anhui, Chine", fz: "Hors UE" },

    // --- DS AUTOMOBILES ---
    { code: "ds-4-e-tense", name: "DS 4 E-Tense Électrique", consumption: 16.2, look: 4.0, power: 7.9, practicality: 3.5, price: 54600, quality: 4.2, range: 450, supercharge: 26, trunk: 430, volume: 11.84, surface: 8.05, brand: "France", factory: "Rüsselsheim, Allemagne", fz: "UE" },
    { code: "ds-7-e-tense", name: "DS 7 E-Tense Électrique", consumption: 17.5, look: 4.0, power: 7.2, practicality: 4.0, price: 65000, quality: 4.3, range: 500, supercharge: 27, trunk: 555, volume: 14.14, surface: 8.68, brand: "France", factory: "Mulhouse, France", fz: "France" },

    // --- FORD ---
    { code: "ford-mustang-mach-e-premium", name: "Ford Mustang Mach-E Premium 99kWh", consumption: 20.5, look: 3.5, power: 7.0, practicality: 3.5, price: 66990, quality: 4.0, range: 583, supercharge: 26, trunk: 502, volume: 13.64, surface: 8.80, brand: "États-Unis", factory: "Cuautitlán, Mexique", fz: "Hors UE" }, // Origine
    { code: "ford-explorer-ev", name: "Ford Explorer Extended Range", consumption: 14.2, look: 3.5, power: 6.4, practicality: 4.0, price: 49000, quality: 4.0, range: 602, supercharge: 28, trunk: 470, volume: 13.70, surface: 8.36, brand: "États-Unis", factory: "Cologne, Allemagne", fz: "UE" },

    // --- GEELY ---
    { code: "geely-ex5", name: "Geely EX5", consumption: 16.2, look: 3.5, power: 7.5, practicality: 4.0, price: 41500, quality: 3.5, range: 430, supercharge: 28, trunk: 461, volume: 13.50, surface: 8.30, brand: "Chine", factory: "Ningbo, Chine", fz: "Hors UE" },

    // --- HYUNDAI (Origine) ---
    { code: "hyundai-ioniq-5", name: "Hyundai Ioniq 5 (77,4 kWh - 2RM)", consumption: 20.3, look: 1.5, power: 7.3, practicality: 2.5, price: 55090, quality: 2.0, range: 518, supercharge: 20, trunk: 584, volume: 14.12, surface: 8.77, brand: "Corée du Sud", factory: "Ulsan, Corée du Sud", fz: "Hors UE" },

    // --- KIA ---
    { code: "kia-ev3", name: "Kia EV3 Long Range", consumption: 14.9, look: 4.0, power: 7.5, practicality: 4.0, price: 47500, quality: 3.8, range: 600, supercharge: 31, trunk: 460, volume: 12.41, surface: 7.96, brand: "Corée du Sud", factory: "Gwangmyeong, Corée du Sud", fz: "Hors UE" },
    { code: "kia-ev3-gt", name: "Kia EV3 GT-Line", consumption: 16.2, look: 4.5, power: 5.8, practicality: 3.8, price: 51000, quality: 4.0, range: 560, supercharge: 31, trunk: 460, volume: 12.41, surface: 7.96, brand: "Corée du Sud", factory: "Gwangmyeong, Corée du Sud", fz: "Hors UE" },
    { code: "kia-ev4", name: "Kia EV4 Berline", consumption: 14.8, look: 4.0, power: 7.2, practicality: 3.5, price: 46000, quality: 3.8, range: 530, supercharge: 28, trunk: 440, volume: 12.26, surface: 8.28, brand: "Corée du Sud", factory: "Gwangmyeong, Corée du Sud", fz: "Hors UE" },
    { code: "kia-ev4-fastback", name: "Kia EV4 Fastback", consumption: 14.6, look: 4.5, power: 7.2, practicality: 3.5, price: 48000, quality: 3.8, range: 540, supercharge: 28, trunk: 450, volume: 12.25, surface: 8.34, brand: "Corée du Sud", factory: "Gwangmyeong, Corée du Sud", fz: "Hors UE" },
    { code: "kia-ev4-gt", name: "Kia EV4 GT", consumption: 16.5, look: 4.5, power: 4.8, practicality: 3.5, price: 54500, quality: 4.0, range: 490, supercharge: 28, trunk: 440, volume: 12.26, surface: 8.28, brand: "Corée du Sud", factory: "Gwangmyeong, Corée du Sud", fz: "Hors UE" },
    { code: "kia-ev5", name: "Kia EV5", consumption: 17.2, look: 3.5, power: 7.8, practicality: 4.5, price: 53500, quality: 3.8, range: 530, supercharge: 27, trunk: 513, volume: 14.84, surface: 8.65, brand: "Corée du Sud", factory: "Yancheng, Chine", fz: "Hors UE" },
    { code: "kia-ev5-gt", name: "Kia EV5 GT", consumption: 18.8, look: 4.0, power: 5.2, practicality: 4.2, price: 59200, quality: 4.0, range: 490, supercharge: 27, trunk: 513, volume: 14.84, surface: 8.65, brand: "Corée du Sud", factory: "Yancheng, Chine", fz: "Hors UE" },
    { code: "kia-ev6", name: "Kia EV6 (77,4 kWh - 2RM)", consumption: 19.7, look: 2.0, power: 7.0, practicality: 2.5, price: 60090, quality: 3.0, range: 532, supercharge: 21, trunk: 572, volume: 13.64, surface: 8.80, brand: "Corée du Sud", factory: "Gwangmyeong, Corée du Sud", fz: "Hors UE" }, // Origine

    // --- LEAPMOTOR ---
    { code: "leapmotor-c10", name: "Leapmotor C10", consumption: 18.2, look: 3.5, power: 7.3, practicality: 4.5, price: 38900, quality: 3.5, range: 420, supercharge: 30, trunk: 435, volume: 14.50, surface: 8.89, brand: "Chine", factory: "Jinhua, Chine", fz: "Hors UE" },

    // --- LYNK & CO ---
    { code: "lynk-co-02", name: "Lynk & Co 02", consumption: 15.8, look: 4.2, power: 5.5, practicality: 3.5, price: 39800, quality: 4.0, range: 445, supercharge: 30, trunk: 440, volume: 12.80, surface: 8.12, brand: "Chine", factory: "Luqiao, Chine", fz: "Hors UE" },

    // --- MERCEDES ---
    { code: "mercedes-eqb-250", name: "Mercedes EQB 250", consumption: 19.8, look: 0.5, power: 8.9, practicality: 5.0, price: 63850, quality: 3.5, range: 478, supercharge: 30, trunk: 520, volume: 14.30, surface: 8.56, brand: "Allemagne", factory: "Kecskemét, Hongrie", fz: "UE" }, // Origine
    { code: "mercedes-eqa-250", name: "Mercedes EQA 250+", consumption: 15.7, look: 1.0, power: 8.6, practicality: 3.0, price: 54500, quality: 3.5, range: 560, supercharge: 32, trunk: 340, volume: 13.26, surface: 8.19, brand: "Allemagne", factory: "Rastatt, Allemagne", fz: "UE" },

    // --- MG MOTOR ---
    { code: "mg-marvel-r", name: "MG Marvel R Luxury", consumption: 19.4, look: 3.5, power: 7.9, practicality: 3.5, price: 48000, quality: 3.5, range: 402, supercharge: 30, trunk: 357, volume: 14.00, surface: 8.60, brand: "Royaume-Uni", factory: "Shanghai, Chine", fz: "Hors UE" },

    // --- NISSAN ---
    { code: "nissan-ariya-87", name: "Nissan Ariya 87 kWh", consumption: 18.2, look: 4.0, power: 7.6, practicality: 4.0, price: 60000, quality: 4.0, range: 533, supercharge: 30, trunk: 468, volume: 14.60, surface: 8.65, brand: "Japon", factory: "Tochigi, Japon", fz: "Hors UE" },

    // --- OPEL ---
    { code: "opel-astra-electric", name: "Opel Astra Electric", consumption: 14.8, look: 3.5, power: 9.2, practicality: 3.5, price: 47200, quality: 3.5, range: 418, supercharge: 26, trunk: 352, volume: 12.00, surface: 7.88, brand: "Allemagne", factory: "Rüsselsheim, Allemagne", fz: "UE" },

    // --- PEUGEOT ---
    { code: "peugeot-e-308", name: "Peugeot e-308", consumption: 15.1, look: 4.0, power: 9.8, practicality: 3.5, price: 48500, quality: 3.8, range: 416, supercharge: 26, trunk: 361, volume: 12.00, surface: 7.93, brand: "France", factory: "Mulhouse, France", fz: "France" },
    { code: "peugeot-e-3008-73", name: "Peugeot e-3008 73 kWh", consumption: 16.7, look: 4.2, power: 8.8, practicality: 4.0, price: 52000, quality: 4.0, range: 527, supercharge: 30, trunk: 520, volume: 14.10, surface: 8.62, brand: "France", factory: "Sochaux, France", fz: "France" },
    { code: "peugeot-e-5008-73", name: "Peugeot e-5008 73 kWh", consumption: 17.7, look: 4.0, power: 9.7, practicality: 5.0, price: 55000, quality: 4.0, range: 502, supercharge: 30, trunk: 748, volume: 15.40, surface: 9.04, brand: "France", factory: "Sochaux, France", fz: "France" },

    // --- POLESTAR ---
    { code: "polestar-2-lr", name: "Polestar 2 Long Range Single Motor", consumption: 14.8, look: 4.5, power: 6.2, practicality: 3.5, price: 64000, quality: 4.5, range: 655, supercharge: 28, trunk: 405, volume: 12.70, surface: 8.66, brand: "Suède", factory: "Luqiao, Chine", fz: "Hors UE" },
    { code: "polestar-4-lr", name: "Polestar 4 Long Range Single Motor", consumption: 17.8, look: 4.8, power: 7.1, practicality: 4.0, price: 75500, quality: 4.5, range: 620, supercharge: 30, trunk: 526, volume: 14.20, surface: 9.10, brand: "Suède", factory: "Hangzhou, Chine", fz: "Hors UE" },

    // --- RENAULT (Origine) ---
    { code: "renault-scenic-e-tech-87", name: "Renault Scenic E-Tech Grande Autonomie", consumption: 15.5, look: 3.5, power: 7.9, practicality: 4.0, price: 48640, quality: 3.0, range: 633, supercharge: 25, trunk: 545, volume: 13.10, surface: 8.33, brand: "France", factory: "Douai, France", fz: "France" },

    // --- SKODA ---
    { code: "skoda-enyaq", name: "Skoda Enyaq iV 80", consumption: 19.2, look: 3.5, power: 8.6, practicality: 3.0, price: 57180, quality: 2.5, range: 520, supercharge: 27, trunk: 585, volume: 14.16, surface: 8.74, brand: "Tchéquie", factory: "Mladá Boleslav, Tchéquie", fz: "UE" }, // Origine
    { code: "skoda-elroq-85", name: "Skoda Elroq 85", consumption: 14.9, look: 3.5, power: 6.6, practicality: 4.0, price: 48500, quality: 2.5, range: 581, supercharge: 28, trunk: 470, volume: 13.74, surface: 8.46, brand: "Tchéquie", factory: "Mladá Boleslav, Tchéquie", fz: "UE" },

    // --- SMART ---
    { code: "smart-1-pro-plus", name: "Smart #1 Pro+", consumption: 17.4, look: 3.5, power: 6.7, practicality: 3.5, price: 48500, quality: 4.0, range: 420, supercharge: 29, trunk: 323, volume: 12.80, surface: 7.92, brand: "Allemagne", factory: "Xi'an, Chine", fz: "Hors UE" },
    { code: "smart-3-pro-plus", name: "Smart #3 Pro+", consumption: 16.3, look: 4.0, power: 5.8, practicality: 3.5, price: 50800, quality: 4.0, range: 455, supercharge: 29, trunk: 370, volume: 12.70, surface: 8.04, brand: "Allemagne", factory: "Xi'an, Chine", fz: "Hors UE" },

    // --- TESLA (Origine) ---
    { code: "tesla-model-3", name: "Tesla Model 3 Grande Autonomie", consumption: 19.6, look: 5.0, power: 4.4, practicality: 1.5, price: 50990, quality: 3.0, range: 600, supercharge: 21, trunk: 542, volume: 12.49, surface: 8.68, brand: "États-Unis", factory: "Shanghai, Chine", fz: "Hors UE" },
    { code: "tesla-model-y", name: "Tesla Model Y Grande Autonomie", consumption: 17.6, look: 4.0, power: 5.0, practicality: 2.0, price: 52990, quality: 3.5, range: 510, supercharge: 21, trunk: 971, volume: 14.77, surface: 9.12, brand: "États-Unis", factory: "Berlin, Allemagne", fz: "UE" },

    // --- VOLKSWAGEN ---
    { code: "volkswagen-id4", name: "Volkswagen ID4 Pro", consumption: 20.9, look: 3.0, power: 10.4, practicality: 3.5, price: 56620, quality: 2.0, range: 489, supercharge: 27, trunk: 543, volume: 13.90, surface: 8.47, brand: "Allemagne", factory: "Zwickau, Allemagne", fz: "UE" }, // Origine
    { code: "volkswagen-id5", name: "Volkswagen ID5 Pro", consumption: 20.9, look: 3.0, power: 10.4, practicality: 3.5, price: 60690, quality: 2.5, range: 490, supercharge: 27, trunk: 549, volume: 13.70, surface: 8.51, brand: "Allemagne", factory: "Zwickau, Allemagne", fz: "UE" }, // Origine
    { code: "volkswagen-id3", name: "Volkswagen ID.3 Pro S", consumption: 15.7, look: 3.0, power: 8.2, practicality: 3.5, price: 50000, quality: 2.0, range: 568, supercharge: 26, trunk: 385, volume: 12.09, surface: 7.71, brand: "Allemagne", factory: "Zwickau, Allemagne", fz: "UE" },
    { code: "volkswagen-id7", name: "Volkswagen ID.7 Pro", consumption: 14.1, look: 3.5, power: 6.5, practicality: 4.0, price: 61500, quality: 2.5, range: 621, supercharge: 28, trunk: 532, volume: 14.21, surface: 9.24, brand: "Allemagne", factory: "Emden, Allemagne", fz: "UE" },

    // --- VOLVO ---
    { code: "volvo-ex30", name: "Volvo EX30 Extended Range", consumption: 15.7, look: 4.5, power: 5.3, practicality: 2.5, price: 48800, quality: 4.0, range: 476, supercharge: 26, trunk: 318, volume: 12.08, surface: 7.77, brand: "Suède", factory: "Zhangjiakou, Chine", fz: "Hors UE" },
    { code: "volvo-ex40", name: "Volvo EX40 Extended Range", consumption: 16.6, look: 3.5, power: 7.3, practicality: 3.5, price: 61000, quality: 4.0, range: 572, supercharge: 28, trunk: 452, volume: 13.62, surface: 8.26, brand: "Suède", factory: "Gand, Belgique", fz: "UE" },
    { code: "volvo-ec40", name: "Volvo EC40 Extended Range", consumption: 16.2, look: 4.0, power: 7.3, practicality: 3.0, price: 62700, quality: 4.0, range: 583, supercharge: 28, trunk: 413, volume: 13.13, surface: 8.26, brand: "Suède", factory: "Gand, Belgique", fz: "UE" },
    { code: "volvo-ex60", name: "Volvo EX60", consumption: 17.0, look: 4.5, power: 5.5, practicality: 4.0, price: 73500, quality: 4.5, range: 600, supercharge: 22, trunk: 520, volume: 14.71, surface: 9.03, brand: "Suède", factory: "Torslanda, Suède", fz: "UE" },
    { code: "volvo-xc40-recharge", name: "Volvo XC40 Recharge", consumption: 19.9, look: 3.0, power: 7.4, practicality: 3.5, price: 55260, quality: 3.5, range: 574, supercharge: 23, trunk: 452, volume: 13.89, surface: 8.42, brand: "Suède", factory: "Gand, Belgique", fz: "UE" }, // Origine

    // --- XPENG ---
    { code: "xpeng-g6-lr", name: "Xpeng G6 RWD Long Range", consumption: 17.5, look: 3.5, power: 6.7, practicality: 4.0, price: 51000, quality: 4.0, range: 570, supercharge: 20, trunk: 571, volume: 14.50, surface: 8.90, brand: "Chine", factory: "Guangzhou, Chine", fz: "Hors UE" },
    { code: "xpeng-g9", name: "Xpeng G9 Long Range", consumption: 18.0, look: 3.5, power: 6.4, practicality: 4.5, price: 59990, quality: 4.0, range: 585, supercharge: 20, trunk: 660, volume: 15.82, surface: 9.47, brand: "Chine", factory: "Guangzhou, Chine", fz: "Hors UE" },

    // --- ZEEKR ---
    { code: "zeekr-7x", name: "Zeekr 7X Long Range", consumption: 17.5, look: 4.0, power: 6.0, practicality: 4.5, price: 52990, quality: 4.2, range: 615, supercharge: 16, trunk: 616, volume: 15.24, surface: 9.24, brand: "Chine", factory: "Ningbo, Chine", fz: "Hors UE" },
    { code: "zeekr-x-lr", name: "Zeekr X Long Range", consumption: 16.4, look: 4.2, power: 5.6, practicality: 3.0, price: 50500, quality: 4.2, range: 445, supercharge: 29, trunk: 362, volume: 12.50, surface: 8.04, brand: "Chine", factory: "Ningbo, Chine", fz: "Hors UE" }
].map(car => ({ ...car, chargeRate: (car.range * 0.6) / car.supercharge }));

// Plage du curseur "Budget maximum" : bornée par le véhicule le moins cher et le
// plus cher du jeu de données. Dérivée de CARS pour rester juste quand des modèles
// sont ajoutés ou retirés. Les deux bornes sont arrondies vers le HAUT au pas du
// curseur : à fond à gauche le moins cher reste affiché (et non une liste vide),
// à fond à droite le plus cher est atteignable, l'amplitude restant un multiple
// du pas pour que les deux extrémités soient réellement sélectionnables.
export const PRICE_STEP = 500;
export const PRICE_RANGE = {
    min: Math.ceil(Math.min(...CARS.map(c => c.price)) / PRICE_STEP) * PRICE_STEP,
    max: Math.ceil(Math.max(...CARS.map(c => c.price)) / PRICE_STEP) * PRICE_STEP
};

export const ASSEMBLY_ZONES = ["France", "UE", "Hors UE"];

export const BRANDS = [...new Set(CARS.map(c => c.brand))].sort((a, b) => a.localeCompare(b, "fr"));

// Photos de fiche véhicule, indexées par `code`. Les fichiers vivent dans
// `img/<code>/` et ne sont servis qu'en AVIF : à qualité perçue équivalente le
// format pèse 2 à 5 fois moins qu'un JPEG. Sur une page dont le poids est
// dominé par les images, c'est le levier d'éco-conception le plus direct.
//
// Un `code` absent (ou un tableau vide) fait retomber la fiche sur le gabarit
// « pas encore de photos » : aucun lien d'image cassé.
//
// Pour ajouter des photos : déposez vos fichiers (jpg, jpeg, png ou webp),
// lancez `tools/to-avif.sh <code> <fichiers…>`, puis collez ici l'entrée que
// le script affiche — il renseigne déjà `file`, `w` et `h`. Restent à écrire
// `label` (légende affichée sous la photo) et `alt` (description lue par les
// lecteurs d'écran, obligatoire).
//
// `w` / `h` sont les dimensions réelles du fichier : posées sur le `<img>`,
// elles réservent la place avant le chargement et évitent tout décalage de
// mise en page.
export const PHOTOS = {
    // "tesla-model-y": [
    //     { file: "profil.avif", w: 1600, h: 1000, label: "Vue de côté", alt: "Tesla Model Y vue de profil, côté conducteur." },
    //     { file: "coffre.avif", w: 1600, h: 1000, label: "Coffre ouvert", alt: "Coffre arrière hayon ouvert, plancher et bac de rangement sous le plancher." },
    //     { file: "tableau-de-bord.avif", w: 1600, h: 1000, label: "Tableau de bord", alt: "Planche de bord avec l'écran tactile central, le volant et la console." },
    //     { file: "sieges-avant.avif", w: 1600, h: 1000, label: "Sièges avant", alt: "Les deux sièges avant et la console centrale." },
    //     { file: "sieges-arriere.avif", w: 1600, h: 1000, label: "Sièges arrière", alt: "Banquette arrière trois places et accoudoir central." }
    // ]
};
