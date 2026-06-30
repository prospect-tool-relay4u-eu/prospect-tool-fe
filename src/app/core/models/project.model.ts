export type FieldType = 'STRING' | 'BOOLEAN' | 'INTEGER' | 'NUMBER';

export interface FieldDefinition {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  order: number;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  fields: FieldDefinition[];
  createdAt: string;
}

export interface ProjectSummary {
  id: number;
  name: string;
  description: string;
  fieldCount: number;
  recordCount: number;
  createdAt: string;
}

export interface ProspectRecord {
  id: string;
  projectId: number;
  values: Record<string, unknown>;
  createdAt: string;
}

export function generateSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/ą/g, 'a')
    .replace(/ę/g, 'e')
    .replace(/ó/g, 'o')
    .replace(/ś/g, 's')
    .replace(/ł/g, 'l')
    .replace(/ż/g, 'z')
    .replace(/ź/g, 'z')
    .replace(/ć/g, 'c')
    .replace(/ń/g, 'n')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
