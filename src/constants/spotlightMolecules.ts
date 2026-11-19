export interface SpotlightMolecule {
  id: string;
  name: string;
  query: string;
  formula: string;
  formattedFormula: string;
  tag: string;
  description: string;
  category: string;
}

/**
 * Curated catalog of 100 diverse molecules for Spotlight Notifications.
 * Rather than bloating the JS bundle with 3D SDF coordinate data for all 100 compounds,
 * these spotlight entries contain lightweight metadata (formula, tags, descriptions).
 * Tapping any notification fetches the 3D structure from PubChem and caches it on disk!
 */
export const SPOTLIGHT_MOLECULES: SpotlightMolecule[] = [
  // =========================================================================
  // 1. Biochemicals & Neurotransmitters
  // =========================================================================
  {
    id: "caffeine",
    name: "Caffeine",
    query: "Caffeine",
    formula: "C8H10N4O2",
    formattedFormula: "C₈H₁₀N₄O₂",
    tag: "Stimulant",
    category: "Biochemicals & Neurotransmitters",
    description:
      "The world's most widely consumed central nervous system stimulant, naturally found in coffee and tea.",
  },
  {
    id: "dopamine",
    name: "Dopamine",
    query: "Dopamine",
    formula: "C8H11NO2",
    formattedFormula: "C₈H₁₁NO₂",
    tag: "Neurotransmitter",
    category: "Biochemicals & Neurotransmitters",
    description:
      "A key catecholamine neurotransmitter driving reward pathways, motivation, motor control, and focus.",
  },
  {
    id: "serotonin",
    name: "Serotonin",
    query: "Serotonin",
    formula: "C10H12N2O",
    formattedFormula: "C₁₀H₁₂N₂O",
    tag: "Mood Regulator",
    category: "Biochemicals & Neurotransmitters",
    description:
      "An essential monoamine neurotransmitter modulating mood, sleep cycles, emotions, and gut motility.",
  },
  {
    id: "adenine",
    name: "Adenine",
    query: "Adenine",
    formula: "C5H5N5",
    formattedFormula: "C₅H₅N₅",
    tag: "DNA Base",
    category: "Biochemicals & Neurotransmitters",
    description:
      "A fundamental purine nucleobase that pairs with thymine in DNA and forms the core of cellular ATP.",
  },
  {
    id: "epinephrine",
    name: "Epinephrine",
    query: "Epinephrine",
    formula: "C9H13NO3",
    formattedFormula: "C₉H₁₃NO₃",
    tag: "Fight-or-Flight Hormone",
    category: "Biochemicals & Neurotransmitters",
    description:
      "Also known as adrenaline, rapidly increasing heart rate and blood flow during sudden stress.",
  },
  {
    id: "norepinephrine",
    name: "Norepinephrine",
    query: "Norepinephrine",
    formula: "C8H11NO3",
    formattedFormula: "C₈H₁₁NO₃",
    tag: "Neurotransmitter",
    category: "Biochemicals & Neurotransmitters",
    description:
      "A vital neurotransmitter and hormone mobilizing the brain and body for acute action and alertness.",
  },
  {
    id: "melatonin",
    name: "Melatonin",
    query: "Melatonin",
    formula: "C13H16N2O2",
    formattedFormula: "C₁₃H₁₆N₂O₂",
    tag: "Sleep Hormone",
    category: "Biochemicals & Neurotransmitters",
    description:
      "A pineal hormone that synchronizes the human circadian clock and promotes restorative restful sleep.",
  },
  {
    id: "gaba",
    name: "GABA",
    query: "GABA",
    formula: "C4H9NO2",
    formattedFormula: "C₄H₉NO₂",
    tag: "Inhibitory Neurotransmitter",
    category: "Biochemicals & Neurotransmitters",
    description:
      "Gamma-aminobutyric acid, the primary inhibitory neurotransmitter damping neuronal excitability.",
  },
  {
    id: "oxytocin",
    name: "Oxytocin",
    query: "Oxytocin",
    formula: "C43H66N12O12S2",
    formattedFormula: "C₄₃H₆₆N₁₂O₁₂S₂",
    tag: "Neuropeptide Hormone",
    category: "Biochemicals & Neurotransmitters",
    description:
      "The bonding neuropeptide that facilitates maternal affection, trust, empathy, and social connection.",
  },
  {
    id: "acetylcholine",
    name: "Acetylcholine",
    query: "Acetylcholine",
    formula: "C7H16NO2",
    formattedFormula: "C₇H₁₆NO₂",
    tag: "Neurotransmitter",
    category: "Biochemicals & Neurotransmitters",
    description:
      "The neuromuscular transmitter that relays signals between motor nerves and contracting muscle fibers.",
  },
  {
    id: "histamine",
    name: "Histamine",
    query: "Histamine",
    formula: "C5H9N3",
    formattedFormula: "C₅H₉N₃",
    tag: "Immune Mediator",
    category: "Biochemicals & Neurotransmitters",
    description:
      "A bioactive nitrogenous compound mediating inflammatory responses, stomach acid, and wakefulness.",
  },
  {
    id: "anandamide",
    name: "Anandamide",
    query: "Anandamide",
    formula: "C22H37NO2",
    formattedFormula: "C₂₂H₃₇NO₂",
    tag: "Endocannabinoid",
    category: "Biochemicals & Neurotransmitters",
    description:
      "The bliss molecule, an endogenous cannabinoid involved in mood, memory, pain relief, and appetite.",
  },
  {
    id: "cortisol",
    name: "Cortisol",
    query: "Cortisol",
    formula: "C21H30O5",
    formattedFormula: "C₂₁H₃₀O₅",
    tag: "Stress Hormone",
    category: "Biochemicals & Neurotransmitters",
    description:
      "A crucial glucocorticoid steroid hormone regulating energy metabolism, glucose, and immune response.",
  },
  {
    id: "testosterone",
    name: "Testosterone",
    query: "Testosterone",
    formula: "C19H28O2",
    formattedFormula: "C₁₉H₂₈O₂",
    tag: "Steroid Hormone",
    category: "Biochemicals & Neurotransmitters",
    description:
      "The primary androgenic hormone driving muscle mass, bone density, and reproductive development.",
  },
  {
    id: "estradiol",
    name: "Estradiol",
    query: "Estradiol",
    formula: "C18H24O2",
    formattedFormula: "C₁₈H₂₄O₂",
    tag: "Estrogen Hormone",
    category: "Biochemicals & Neurotransmitters",
    description:
      "The most potent natural estrogen, essential for female reproductive health and cardiovascular protection.",
  },
  {
    id: "progesterone",
    name: "Progesterone",
    query: "Progesterone",
    formula: "C21H30O2",
    formattedFormula: "C₂₁H₃₀O₂",
    tag: "Steroid Hormone",
    category: "Biochemicals & Neurotransmitters",
    description:
      "An endogenous steroid crucial for the menstrual cycle, pregnancy maintenance, and neuroprotection.",
  },
  {
    id: "thyroxine",
    name: "Thyroxine",
    query: "Thyroxine",
    formula: "C15H11I4NO4",
    formattedFormula: "C₁₅H₁₁I₄NO₄",
    tag: "Thyroid Hormone",
    category: "Biochemicals & Neurotransmitters",
    description:
      "An iodine-packed hormone synthesized by the thyroid gland that governs cellular metabolic rates.",
  },

  // =========================================================================
  // 2. Medicinal & Pharmaceuticals
  // =========================================================================
  {
    id: "aspirin",
    name: "Aspirin",
    query: "Aspirin",
    formula: "C9H8O4",
    formattedFormula: "C₉H₈O₄",
    tag: "Analgesic",
    category: "Medicinal & Pharmaceuticals",
    description:
      "Acetylsalicylic acid, an iconic analgesic and antithrombotic drug used across modern healthcare.",
  },
  {
    id: "penicillin",
    name: "Penicillin",
    query: "Penicillin",
    formula: "C16H18N2O4S",
    formattedFormula: "C₁₆H₁₈N₂O₄S",
    tag: "Antibiotic",
    category: "Medicinal & Pharmaceuticals",
    description:
      "The landmark fungal antibiotic discovered by Alexander Fleming that launched modern antimicrobial therapy.",
  },
  {
    id: "ibuprofen",
    name: "Ibuprofen",
    query: "Ibuprofen",
    formula: "C13H18O2",
    formattedFormula: "C₁₃H₁₈O₂",
    tag: "Anti-inflammatory",
    category: "Medicinal & Pharmaceuticals",
    description:
      "A versatile NSAID that inhibits cyclooxygenase enzymes to relieve headache, fever, and inflammation.",
  },
  {
    id: "paracetamol",
    name: "Paracetamol",
    query: "Paracetamol",
    formula: "C8H9NO2",
    formattedFormula: "C₈H₉NO₂",
    tag: "Pain & Fever Relief",
    category: "Medicinal & Pharmaceuticals",
    description:
      "Also known as acetaminophen, one of the most widely used mild pain relievers and antipyretics globally.",
  },
  {
    id: "amoxicillin",
    name: "Amoxicillin",
    query: "Amoxicillin",
    formula: "C16H19N3O5S",
    formattedFormula: "C₁₆H₁₉N₃O₅S",
    tag: "Beta-Lactam Antibiotic",
    category: "Medicinal & Pharmaceuticals",
    description:
      "A broad-spectrum penicillin derivative prescribed widely for bacterial respiratory and ear infections.",
  },
  {
    id: "metformin",
    name: "Metformin",
    query: "Metformin",
    formula: "C4H11N5",
    formattedFormula: "C₄H₁₁N₅",
    tag: "Antidiabetic",
    category: "Medicinal & Pharmaceuticals",
    description:
      "The cornerstone biguanide oral medication improving insulin sensitivity in type 2 diabetes management.",
  },
  {
    id: "atorvastatin",
    name: "Atorvastatin",
    query: "Atorvastatin",
    formula: "C33H35FN2O5",
    formattedFormula: "C₃₃H₃₅FN₂O₅",
    tag: "Statin Medication",
    category: "Medicinal & Pharmaceuticals",
    description:
      "A statin that selectively inhibits HMG-CoA reductase to reduce blood LDL cholesterol levels.",
  },
  {
    id: "omeprazole",
    name: "Omeprazole",
    query: "Omeprazole",
    formula: "C17H19N3O3S",
    formattedFormula: "C₁₇H₁₉N₃O₃S",
    tag: "Proton Pump Inhibitor",
    category: "Medicinal & Pharmaceuticals",
    description:
      "A gastric acid inhibitor that blocks the H+/K+ ATPase pump to treat heartburn and peptic ulcers.",
  },
  {
    id: "morphine",
    name: "Morphine",
    query: "Morphine",
    formula: "C17H19NO3",
    formattedFormula: "C₁₇H₁₉NO₃",
    tag: "Opioid Analgesic",
    category: "Medicinal & Pharmaceuticals",
    description:
      "A potent alkaloid derived from opium poppies providing gold-standard acute and post-surgical analgesia.",
  },
  {
    id: "codeine",
    name: "Codeine",
    query: "Codeine",
    formula: "C18H21NO3",
    formattedFormula: "C₁₈H₂₁NO₃",
    tag: "Analgesic & Antitussive",
    category: "Medicinal & Pharmaceuticals",
    description:
      "A natural opiate alkaloid used clinically for pain suppression and as an effective cough suppressant.",
  },
  {
    id: "salbutamol",
    name: "Salbutamol",
    query: "Salbutamol",
    formula: "C13H21NO3",
    formattedFormula: "C₁₃H₂₁NO₃",
    tag: "Bronchodilator",
    category: "Medicinal & Pharmaceuticals",
    description:
      "A life-saving beta-2 agonist inhaler compound that rapidly relaxes airway smooth muscle in asthma.",
  },
  {
    id: "dexamethasone",
    name: "Dexamethasone",
    query: "Dexamethasone",
    formula: "C22H29FO5",
    formattedFormula: "C₂₂H₂₉FO₅",
    tag: "Corticosteroid",
    category: "Medicinal & Pharmaceuticals",
    description:
      "A high-potency synthetic glucocorticoid with robust anti-inflammatory and immunosuppressant action.",
  },
  {
    id: "ciprofloxacin",
    name: "Ciprofloxacin",
    query: "Ciprofloxacin",
    formula: "C17H18FN3O3",
    formattedFormula: "C₁₇H₁₈FN₃O₃",
    tag: "Fluoroquinolone",
    category: "Medicinal & Pharmaceuticals",
    description:
      "A fluoroquinolone antibacterial compound that arrests bacterial replication by inhibiting DNA topoisomerase.",
  },
  {
    id: "diazepam",
    name: "Diazepam",
    query: "Diazepam",
    formula: "C16H13ClN2O",
    formattedFormula: "C₁₆H₁₃ClN₂O",
    tag: "Benzodiazepine",
    category: "Medicinal & Pharmaceuticals",
    description:
      "A classic benzodiazepine that enhances inhibitory GABA signaling to ease anxiety and muscle spasms.",
  },
  {
    id: "sildenafil",
    name: "Sildenafil",
    query: "Sildenafil",
    formula: "C22H30N6O4S",
    formattedFormula: "C₂₂H₃₀N₆O₄S",
    tag: "PDE5 Inhibitor",
    category: "Medicinal & Pharmaceuticals",
    description:
      "A vasodilator that selectively blocks PDE5 to elevate cGMP levels and treat pulmonary hypertension.",
  },
  {
    id: "artemisinin",
    name: "Artemisinin",
    query: "Artemisinin",
    formula: "C15H22O5",
    formattedFormula: "C₁₅H₂₂O₅",
    tag: "Antimalarial",
    category: "Medicinal & Pharmaceuticals",
    description:
      "A Nobel Prize-winning sesquiterpene lactone with a peroxide bridge that rapidly clears malaria parasites.",
  },
  {
    id: "warfarin",
    name: "Warfarin",
    query: "Warfarin",
    formula: "C19H16O4",
    formattedFormula: "C₁₉H₁₆O₄",
    tag: "Anticoagulant",
    category: "Medicinal & Pharmaceuticals",
    description:
      "A synthetic coumarin derivative that inhibits vitamin K epoxide reductase to prevent venous thrombosis.",
  },
  {
    id: "methotrexate",
    name: "Methotrexate",
    query: "Methotrexate",
    formula: "C20H22N8O5",
    formattedFormula: "C₂₀H₂₂N₈O₅",
    tag: "Antifolate Chemotherapy",
    category: "Medicinal & Pharmaceuticals",
    description:
      "An antifolate antimetabolite drug used to treat various leukemias and severe rheumatoid arthritis.",
  },
  {
    id: "cisplatin",
    name: "Cisplatin",
    query: "Cisplatin",
    formula: "Cl2H6N2Pt",
    formattedFormula: "Cl₂H₆N₂Pt",
    tag: "Platinum Chemotherapy",
    category: "Medicinal & Pharmaceuticals",
    description:
      "A coordination complex of platinum that crosslinks purine DNA bases to induce cancer cell apoptosis.",
  },
  {
    id: "paclitaxel",
    name: "Paclitaxel",
    query: "Paclitaxel",
    formula: "C47H51NO14",
    formattedFormula: "C₄₇H₅₁NO₁₄",
    tag: "Taxane Chemotherapy",
    category: "Medicinal & Pharmaceuticals",
    description:
      "A complex natural diterpenoid from yew trees that stabilizes microtubules to prevent cancer cell division.",
  },
  {
    id: "losartan",
    name: "Losartan",
    query: "Losartan",
    formula: "C22H23ClN6O",
    formattedFormula: "C₂₂H₂₃ClN₆O",
    tag: "Antihypertensive",
    category: "Medicinal & Pharmaceuticals",
    description:
      "An angiotensin II receptor blocker extensively prescribed to lower arterial pressure and protect kidneys.",
  },

  // =========================================================================
  // 3. Vitamins & Essential Nutrients
  // =========================================================================
  {
    id: "ascorbic-acid",
    name: "Ascorbic Acid",
    query: "Ascorbic Acid",
    formula: "C6H8O6",
    formattedFormula: "C₆H₈O₆",
    tag: "Vitamin C",
    category: "Vitamins & Essential Nutrients",
    description:
      "A powerhouse water-soluble antioxidant required for collagen synthesis, wound repair, and immunity.",
  },
  {
    id: "retinol",
    name: "Retinol",
    query: "Retinol",
    formula: "C20H30O",
    formattedFormula: "C₂₀H₃₀O",
    tag: "Vitamin A",
    category: "Vitamins & Essential Nutrients",
    description:
      "An indispensable lipid-soluble retinoid necessary for rod vision in dim light and epithelial maintenance.",
  },
  {
    id: "cholecalciferol",
    name: "Cholecalciferol",
    query: "Cholecalciferol",
    formula: "C27H44O",
    formattedFormula: "C₂₇H₄₄O",
    tag: "Vitamin D3",
    category: "Vitamins & Essential Nutrients",
    description:
      "The sunshine vitamin converted by skin upon UV exposure to maintain bone density and immune defense.",
  },
  {
    id: "alpha-tocopherol",
    name: "Alpha-Tocopherol",
    query: "alpha-tocopherol",
    formula: "C29H50O2",
    formattedFormula: "C₂₉H₅₀O₂",
    tag: "Vitamin E",
    category: "Vitamins & Essential Nutrients",
    description:
      "A fat-soluble antioxidant defending polyunsaturated cell membrane lipids from free radical damage.",
  },
  {
    id: "phylloquinone",
    name: "Phylloquinone",
    query: "Phylloquinone",
    formula: "C31H46O2",
    formattedFormula: "C₃₁H₄₆O₂",
    tag: "Vitamin K1",
    category: "Vitamins & Essential Nutrients",
    description:
      "A plant naphthoquinone acting as an essential cofactor for gamma-glutamyl carboxylase in blood clotting.",
  },
  {
    id: "thiamine",
    name: "Thiamine",
    query: "Thiamine",
    formula: "C12H17N4OS",
    formattedFormula: "C₁₂H₁₇N₄OS",
    tag: "Vitamin B1",
    category: "Vitamins & Essential Nutrients",
    description:
      "An essential sulfur-bearing vitamin facilitating pyruvate decarboxylation and cellular energy metabolism.",
  },
  {
    id: "riboflavin",
    name: "Riboflavin",
    query: "Riboflavin",
    formula: "C17H20N4O6",
    formattedFormula: "C₁₇H₂₀N₄O₆",
    tag: "Vitamin B2",
    category: "Vitamins & Essential Nutrients",
    description:
      "The brightly colored flavin micronutrient forming central redox cofactors FMN and FAD in mitochondria.",
  },
  {
    id: "niacin",
    name: "Niacin",
    query: "Niacin",
    formula: "C6H5NO2",
    formattedFormula: "C₆H₅NO₂",
    tag: "Vitamin B3",
    category: "Vitamins & Essential Nutrients",
    description:
      "Nicotinic acid, converted into NAD and NADP coenzymes vital for ATP synthesis and cellular repair.",
  },
  {
    id: "pantothenic-acid",
    name: "Pantothenic Acid",
    query: "Pantothenic Acid",
    formula: "C9H17NO5",
    formattedFormula: "C₉H₁₇NO₅",
    tag: "Vitamin B5",
    category: "Vitamins & Essential Nutrients",
    description:
      "The key structural precursor required to synthesize Coenzyme A and metabolize fatty acids.",
  },
  {
    id: "pyridoxine",
    name: "Pyridoxine",
    query: "Pyridoxine",
    formula: "C8H11NO3",
    formattedFormula: "C₈H₁₁NO₃",
    tag: "Vitamin B6",
    category: "Vitamins & Essential Nutrients",
    description:
      "A pyridine cofactor that enables transamination and amino acid metabolism throughout the central nervous system.",
  },
  {
    id: "biotin",
    name: "Biotin",
    query: "Biotin",
    formula: "C10H16N2O3S",
    formattedFormula: "C₁₀H₁₆N₂O₃S",
    tag: "Vitamin B7",
    category: "Vitamins & Essential Nutrients",
    description:
      "A sulfur-containing B vitamin serving as a prosthetic group for key carboxylase enzymes.",
  },
  {
    id: "folic-acid",
    name: "Folic Acid",
    query: "Folic Acid",
    formula: "C19H19N7O6",
    formattedFormula: "C₁₉H₁₉N₇O₆",
    tag: "Vitamin B9",
    category: "Vitamins & Essential Nutrients",
    description:
      "Essential for one-carbon transfers during DNA purine/pyrimidine biosynthesis and healthy neural tube development.",
  },
  {
    id: "cyanocobalamin",
    name: "Cyanocobalamin",
    query: "Cyanocobalamin",
    formula: "C63H88CoN14O14P",
    formattedFormula: "C₆₃H₈₈CoN₁₄O₁₄P",
    tag: "Vitamin B12",
    category: "Vitamins & Essential Nutrients",
    description:
      "A sophisticated organometallic complex containing cobalt that protects myelin sheaths and blood cell production.",
  },

  // =========================================================================
  // 4. Aromas, Flavors & Phytochemicals
  // =========================================================================
  {
    id: "vanillin",
    name: "Vanillin",
    query: "Vanillin",
    formula: "C8H8O3",
    formattedFormula: "C₈H₈O₃",
    tag: "Flavor Compound",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "The sweet aromatic phenolic aldehyde responsible for the characteristic warmth and flavor of vanilla.",
  },
  {
    id: "menthol",
    name: "Menthol",
    query: "Menthol",
    formula: "C10H20O",
    formattedFormula: "C₁₀H₂₀O",
    tag: "Cooling Terpenoid",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "An organic monoterpene alcohol from mint that triggers TRPM8 receptors to deliver a refreshing cold sensation.",
  },
  {
    id: "cinnamaldehyde",
    name: "Cinnamaldehyde",
    query: "Cinnamaldehyde",
    formula: "C9H8O",
    formattedFormula: "C₉H₈O",
    tag: "Spice Aroma",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "The warm, fragrant aldehyde that produces the signature sweet-spicy scent and taste of natural cinnamon.",
  },
  {
    id: "capsaicin",
    name: "Capsaicin",
    query: "Capsaicin",
    formula: "C18H27NO3",
    formattedFormula: "C₁₈H₂₇NO₃",
    tag: "Spicy Capsaicinoid",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "The fiery vanilloid in hot chili peppers that activates sensory pain and heat receptors on the tongue.",
  },
  {
    id: "eugenol",
    name: "Eugenol",
    query: "Eugenol",
    formula: "C10H12O2",
    formattedFormula: "C₁₀H₁₂O₂",
    tag: "Clove Phenol",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "An aromatic phenylpropanoid extracted from clove oil widely known for its soothing scent and dental use.",
  },
  {
    id: "limonene",
    name: "Limonene",
    query: "Limonene",
    formula: "C10H16",
    formattedFormula: "C₁₀H₁₆",
    tag: "Citrus Terpene",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "A bright monoterpene concentrated in citrus rinds that gives oranges and lemons their zesty perfume.",
  },
  {
    id: "linalool",
    name: "Linalool",
    query: "Linalool",
    formula: "C10H18O",
    formattedFormula: "C₁₀H₁₈O",
    tag: "Floral Terpenoid",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "A naturally occurring floral terpene alcohol that imparts calming aromas in lavender, mint, and basil.",
  },
  {
    id: "resveratrol",
    name: "Resveratrol",
    query: "Resveratrol",
    formula: "C14H12O3",
    formattedFormula: "C₁₄H₁₂O₃",
    tag: "Red Wine Polyphenol",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "A natural phytoalexin stilbenoid found in red grape skins renowned for its antioxidant properties.",
  },
  {
    id: "curcumin",
    name: "Curcumin",
    query: "Curcumin",
    formula: "C21H20O6",
    formattedFormula: "C₂₁H₂₀O₆",
    tag: "Turmeric Antioxidant",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "The vibrant yellow bioactive diarylheptanoid in turmeric root with potent anti-inflammatory effects.",
  },
  {
    id: "quercetin",
    name: "Quercetin",
    query: "Quercetin",
    formula: "C15H10O7",
    formattedFormula: "C₁₅H₁₀O₇",
    tag: "Plant Flavonoid",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "A ubiquitous plant flavonol antioxidant abundant in onions, apples, berries, and green tea.",
  },
  {
    id: "cannabidiol",
    name: "Cannabidiol",
    query: "Cannabidiol",
    formula: "C21H30O2",
    formattedFormula: "C₂₁H₃₀O₂",
    tag: "Phytocannabinoid",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "CBD, a prominent non-psychoactive cannabis compound studied for neuroprotective and calming effects.",
  },
  {
    id: "allicin",
    name: "Allicin",
    query: "Allicin",
    formula: "C6H10OS2",
    formattedFormula: "C₆H₁₀OS₂",
    tag: "Garlic Thiosulfinate",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "A pungent organosulfur compound generated when fresh garlic is crushed, displaying natural antimicrobial action.",
  },
  {
    id: "piperine",
    name: "Piperine",
    query: "Piperine",
    formula: "C17H19NO3",
    formattedFormula: "C₁₇H₁₉NO₃",
    tag: "Black Pepper Alkaloid",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "The sharp alkaloid that gives black pepper its pungency and substantially enhances nutrient absorption.",
  },
  {
    id: "anethole",
    name: "Anethole",
    query: "Anethole",
    formula: "C10H12O",
    formattedFormula: "C₁₀H₁₂O",
    tag: "Anise & Fennel Flavor",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "An aromatic phenylpropene giving anise seed, star anise, and fennel their intensely sweet licorice flavor.",
  },
  {
    id: "carvone",
    name: "Carvone",
    query: "Carvone",
    formula: "C10H14O",
    formattedFormula: "C₁₀H₁₄O",
    tag: "Spearmint Terpenoid",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "A chiral monoterpenoid whose optical mirror enantiomers produce crisp spearmint or earthy caraway scents.",
  },
  {
    id: "zingiberene",
    name: "Zingiberene",
    query: "Zingiberene",
    formula: "C15H24",
    formattedFormula: "C₁₅H₂₄",
    tag: "Ginger Sesquiterpene",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "A fragrant sesquiterpene hydrocarbon contributing up to thirty percent of the essential oil in fresh ginger root.",
  },
  {
    id: "geraniol",
    name: "Geraniol",
    query: "Geraniol",
    formula: "C10H18O",
    formattedFormula: "C₁₀H₁₈O",
    tag: "Rose Terpenoid",
    category: "Aromas, Flavors & Phytochemicals",
    description:
      "A sweet monoterpenoid alcohol that produces the signature elegant floral fragrance of rose oil.",
  },

  // =========================================================================
  // 5. Nucleic Acids, Energetics & Biomolecules
  // =========================================================================
  {
    id: "guanine",
    name: "Guanine",
    query: "Guanine",
    formula: "C5H5N5O",
    formattedFormula: "C₅H₅N₅O",
    tag: "DNA/RNA Base",
    category: "Nucleic Acids & Biomolecules",
    description:
      "A vital purine nucleobase that forms three sturdy hydrogen bonds with cytosine in the DNA double helix.",
  },
  {
    id: "cytosine",
    name: "Cytosine",
    query: "Cytosine",
    formula: "C4H5N3O",
    formattedFormula: "C₄H₅N₃O",
    tag: "DNA/RNA Base",
    category: "Nucleic Acids & Biomolecules",
    description:
      "A key pyrimidine nucleobase carrying the genetic code across all terrestrial cellular organisms.",
  },
  {
    id: "thymine",
    name: "Thymine",
    query: "Thymine",
    formula: "C5H6N2O2",
    formattedFormula: "C₅H₆N₂O₂",
    tag: "DNA Base",
    category: "Nucleic Acids & Biomolecules",
    description:
      "A pyrimidine nucleobase specific to DNA that accurately pairs with adenine during chromosome replication.",
  },
  {
    id: "uracil",
    name: "Uracil",
    query: "Uracil",
    formula: "C4H4N2O2",
    formattedFormula: "C₄H₄N₂O₂",
    tag: "RNA Base",
    category: "Nucleic Acids & Biomolecules",
    description:
      "A naturally occurring pyrimidine nucleobase in RNA that replaces thymine in messenger and transfer transcripts.",
  },
  {
    id: "atp",
    name: "ATP",
    query: "Adenosine triphosphate",
    formula: "C10H16N5O13P3",
    formattedFormula: "C₁₀H₁₆N₅O₁₃P₃",
    tag: "Cellular Energy Currency",
    category: "Nucleic Acids & Biomolecules",
    description:
      "Adenosine triphosphate, the universal chemical currency transferring metabolic energy in every living cell.",
  },
  {
    id: "glucose",
    name: "Glucose",
    query: "Glucose",
    formula: "C6H12O6",
    formattedFormula: "C₆H₁₂O₆",
    tag: "Primary Sugar",
    category: "Nucleic Acids & Biomolecules",
    description:
      "The fundamental aldohexose monosaccharide metabolized through glycolysis to power human cellular life.",
  },
  {
    id: "fructose",
    name: "Fructose",
    query: "Fructose",
    formula: "C6H12O6",
    formattedFormula: "C₆H₁₂O₆",
    tag: "Fruit Sugar",
    category: "Nucleic Acids & Biomolecules",
    description:
      "A naturally occurring ketohexose carbohydrate and the sweetest of all natural dietary sugars.",
  },
  {
    id: "sucrose",
    name: "Sucrose",
    query: "Sucrose",
    formula: "C12H22O11",
    formattedFormula: "C₁₂H₂₂O₁₁",
    tag: "Table Sugar",
    category: "Nucleic Acids & Biomolecules",
    description:
      "A disaccharide of glucose and fructose bonded together that serves as standard kitchen table sugar.",
  },
  {
    id: "cholesterol",
    name: "Cholesterol",
    query: "Cholesterol",
    formula: "C27H46O",
    formattedFormula: "C₂₇H₄₆O",
    tag: "Sterol Lipid",
    category: "Nucleic Acids & Biomolecules",
    description:
      "A structural sterol lipid that modulates animal cell membrane fluidity and acts as the steroid precursor.",
  },
  {
    id: "chlorophyll-a",
    name: "Chlorophyll a",
    query: "Chlorophyll a",
    formula: "C55H72MgN4O5",
    formattedFormula: "C₅₅H₇₂MgN₄O₅",
    tag: "Photosynthetic Pigment",
    category: "Nucleic Acids & Biomolecules",
    description:
      "A magnesium-porphyrin pigment that captures blue and red light to power planetary oxygenic photosynthesis.",
  },
  {
    id: "heme",
    name: "Heme",
    query: "Heme",
    formula: "C34H32FeN4O4",
    formattedFormula: "C₃₄H₃₂FeN₄O₄",
    tag: "Oxygen-Carrying Porphyrin",
    category: "Nucleic Acids & Biomolecules",
    description:
      "An iron-coordinated porphyrin prosthetic group enabling hemoglobin to carry oxygen through human blood.",
  },
  {
    id: "glutathione",
    name: "Glutathione",
    query: "Glutathione",
    formula: "C10H17N3O6S",
    formattedFormula: "C₁₀H₁₇N₃O₆S",
    tag: "Master Antioxidant",
    category: "Nucleic Acids & Biomolecules",
    description:
      "A cellular tripeptide that detoxifies harmful peroxides and heavy metals to protect vital cell organs.",
  },
  {
    id: "creatine",
    name: "Creatine",
    query: "Creatine",
    formula: "C4H9N3O2",
    formattedFormula: "C₄H₉N₃O₂",
    tag: "Muscle Energy Buffer",
    category: "Nucleic Acids & Biomolecules",
    description:
      "A nitrogenous organic compound that replenishes ATP in skeletal muscle fibers during explosive exertion.",
  },
  {
    id: "taurine",
    name: "Taurine",
    query: "Taurine",
    formula: "C2H7NO3S",
    formattedFormula: "C₂H₇NO₃S",
    tag: "Amino Sulfonic Acid",
    category: "Nucleic Acids & Biomolecules",
    description:
      "A sulfur amino acid that regulates osmoregulation, membrane stability, and cardiac calcium levels.",
  },

  // =========================================================================
  // 6. Everyday & Industrial Chemistry
  // =========================================================================
  {
    id: "water",
    name: "Water",
    query: "Water",
    formula: "H2O",
    formattedFormula: "H₂O",
    tag: "Universal Solvent",
    category: "Everyday & Industrial Chemistry",
    description:
      "The unique polar, hydrogen-bonding liquid medium that enables the biochemistry of all known life.",
  },
  {
    id: "carbon-dioxide",
    name: "Carbon Dioxide",
    query: "Carbon Dioxide",
    formula: "CO2",
    formattedFormula: "CO₂",
    tag: "Atmospheric Gas",
    category: "Everyday & Industrial Chemistry",
    description:
      "A linear greenhouse gas absorbed by photosynthetic plants and released during cellular respiration.",
  },
  {
    id: "ethanol",
    name: "Ethanol",
    query: "Ethanol",
    formula: "C2H6O",
    formattedFormula: "C₂H₆O",
    tag: "Alcohol",
    category: "Everyday & Industrial Chemistry",
    description:
      "The simple two-carbon alcohol produced by yeast fermentation and used extensively as fuel and solvent.",
  },
  {
    id: "acetic-acid",
    name: "Acetic Acid",
    query: "Acetic Acid",
    formula: "C2H4O2",
    formattedFormula: "C₂H₄O₂",
    tag: "Carboxylic Acid",
    category: "Everyday & Industrial Chemistry",
    description:
      "The sharp, pungent carboxylic acid that gives vinegar its distinctively sour taste and cleaning power.",
  },
  {
    id: "citric-acid",
    name: "Citric Acid",
    query: "Citric Acid",
    formula: "C6H8O7",
    formattedFormula: "C₆H₈O₇",
    tag: "Citrus Acid",
    category: "Everyday & Industrial Chemistry",
    description:
      "A natural tricarboxylic acid responsible for citrus fruit tartness and the central Krebs cycle in metabolism.",
  },
  {
    id: "methane",
    name: "Methane",
    query: "Methane",
    formula: "CH4",
    formattedFormula: "CH₄",
    tag: "Simple Hydrocarbon",
    category: "Everyday & Industrial Chemistry",
    description:
      "The simplest tetrahedral alkane gas and the principal clean-burning constituent of natural gas.",
  },
  {
    id: "ammonia",
    name: "Ammonia",
    query: "Ammonia",
    formula: "NH3",
    formattedFormula: "NH₃",
    tag: "Inorganic Hydride",
    category: "Everyday & Industrial Chemistry",
    description:
      "A pungent gas synthesized via the Haber process that provides nitrogen fertilizer feeding human civilization.",
  },
  {
    id: "nicotine",
    name: "Nicotine",
    query: "Nicotine",
    formula: "C10H14N2",
    formattedFormula: "C₁₀H₁₄N₂",
    tag: "Tobacco Alkaloid",
    category: "Everyday & Industrial Chemistry",
    description:
      "A potent cholinergic agonist alkaloid produced naturally by nightshade plants like tobacco.",
  },
  {
    id: "theobromine",
    name: "Theobromine",
    query: "Theobromine",
    formula: "C7H8N4O2",
    formattedFormula: "C₇H₈N₄O₂",
    tag: "Cocoa Alkaloid",
    category: "Everyday & Industrial Chemistry",
    description:
      "A gentle bitter alkaloid closely related to caffeine that gives dark cocoa and chocolate its mood lift.",
  },
  {
    id: "urea",
    name: "Urea",
    query: "Urea",
    formula: "CH4N2O",
    formattedFormula: "CH₄N₂O",
    tag: "Organic Diamide",
    category: "Everyday & Industrial Chemistry",
    description:
      "The mammalian nitrogen waste compound whose 1828 artificial synthesis founded modern organic chemistry.",
  },
  {
    id: "lactic-acid",
    name: "Lactic Acid",
    query: "Lactic Acid",
    formula: "C3H6O3",
    formattedFormula: "C₃H₆O₃",
    tag: "Alpha-Hydroxy Acid",
    category: "Everyday & Industrial Chemistry",
    description:
      "An organic acid produced during intense anaerobic glycolysis in muscle tissue and bacterial fermentation.",
  },
  {
    id: "benzene",
    name: "Benzene",
    query: "Benzene",
    formula: "C6H6",
    formattedFormula: "C₆H₆",
    tag: "Aromatic Hydrocarbon",
    category: "Everyday & Industrial Chemistry",
    description:
      "The foundational planar hexagonal aromatic compound with delocalized pi electron resonance.",
  },

  // =========================================================================
  // 7. Crystals, Minerals & Inorganics
  // =========================================================================
  {
    id: "fluorite",
    name: "Fluorite",
    query: "Fluorite",
    formula: "CaF2",
    formattedFormula: "CaF₂",
    tag: "Fluorspar / Halide",
    category: "Crystals, Minerals & Inorganics",
    description:
      "A cubic halide mineral renowned for colorful isometric crystal structures and vivid UV fluorescence.",
  },
  {
    id: "sodium-chloride",
    name: "Sodium Chloride",
    query: "Sodium Chloride",
    formula: "NaCl",
    formattedFormula: "NaCl",
    tag: "Halite / Table Salt",
    category: "Crystals, Minerals & Inorganics",
    description:
      "Halite crystal with an iconic face-centered cubic lattice essential for cellular life and food taste.",
  },
  {
    id: "quartz",
    name: "Quartz",
    query: "Quartz",
    formula: "SiO2",
    formattedFormula: "SiO₂",
    tag: "Silicon Dioxide",
    category: "Crystals, Minerals & Inorganics",
    description:
      "A durable tetrahedral mineral exhibiting piezoelectric properties that drive quartz crystal timepieces.",
  },
  {
    id: "calcite",
    name: "Calcite",
    query: "Calcite",
    formula: "CaCO3",
    formattedFormula: "CaCO₃",
    tag: "Calcium Carbonate",
    category: "Crystals, Minerals & Inorganics",
    description:
      "A carbonate mineral demonstrating birefringence, forming limestone, sea shells, and marble rock.",
  },
  {
    id: "pyrite",
    name: "Pyrite",
    query: "Pyrite",
    formula: "FeS2",
    formattedFormula: "FeS₂",
    tag: "Iron Sulfide",
    category: "Crystals, Minerals & Inorganics",
    description:
      "A brassy mineral known as Fool's Gold that forms dazzling striated cubic and pyritohedral crystals.",
  },
  {
    id: "rutile",
    name: "Rutile",
    query: "Rutile",
    formula: "TiO2",
    formattedFormula: "TiO₂",
    tag: "Titanium Oxide",
    category: "Crystals, Minerals & Inorganics",
    description:
      "A titanium dioxide mineral possessing one of the highest refractive indices of any known crystal.",
  },
];

/**
 * Get a random molecule from the spotlight catalog.
 */
export function getRandomSpotlightMolecule(): SpotlightMolecule {
  const index = Math.floor(Math.random() * SPOTLIGHT_MOLECULES.length);
  return SPOTLIGHT_MOLECULES[index];
}

/**
 * Get a spotlight molecule by index, or a random one if out of bounds or omitted.
 */
export function getSpotlightMolecule(index?: number): SpotlightMolecule {
  if (
    typeof index === "number" &&
    index >= 0 &&
    index < SPOTLIGHT_MOLECULES.length
  ) {
    return SPOTLIGHT_MOLECULES[index];
  }
  return getRandomSpotlightMolecule();
}
