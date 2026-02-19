// PubChem Compound JSON structure (PC_Compounds)

export interface PubChemCompoundUrn {
  label?: string;
  name?: string;
  datatype?: number;
  parameters?: string;
  implementation?: string;
  version?: string;
  software?: string;
  source?: string;
  release?: string;
}

export interface PubChemCompoundValue {
  sval?: string;
  ival?: number;
  fval?: number;
  binary?: string;
}

export interface PubChemCompoundProp {
  urn?: PubChemCompoundUrn;
  value?: PubChemCompoundValue;
}

export interface PubChemCompoundId {
  id: {
    cid: number;
  };
}

export interface PubChemCompound {
  id: PubChemCompoundId;
  props?: PubChemCompoundProp[];
}

export interface PubChemCompoundResponse {
  PC_Compounds?: PubChemCompound[];
}

// PubChem PUG View JSON structure (GHS, Description, Properties)

export interface PubChemStringWithMarkup {
  String: string;
  Markup?: any[];
}

export interface PubChemInfoValue {
  StringWithMarkup?: PubChemStringWithMarkup[];
  Number?: number[];
  String?: string;
}

export interface PubChemInformation {
  ReferenceNumber?: number;
  Name?: string;
  Value?: PubChemInfoValue;
  Description?: string;
  Synonym?: string[];
}

export interface PubChemSection {
  TOCHeading?: string;
  Description?: string;
  Section?: PubChemSection[];
  Information?: PubChemInformation[];
}

export interface PubChemRecord {
  RecordType?: string;
  RecordNumber?: number;
  RecordTitle?: string;
  Section?: PubChemSection[];
}

export interface PubChemViewResponse {
  Record?: PubChemRecord;
}

// Synonyms endpoint and Description endpoint often return InformationList

export interface PubChemInformationList {
  Information?: PubChemInformation[];
}

export interface PubChemInformationResponse {
  InformationList?: PubChemInformationList;
}

export type PubChemSynonymResponse = PubChemInformationResponse;

// Autocomplete response

export interface PubChemAutocompleteResponse {
  total?: number;
  dictionary_terms?: {
    compound?: string[];
    [key: string]: any;
  };
}
